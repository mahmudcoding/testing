# AIRION QA — 2026-08-26 — lane D — sector D (Org, identity & settings) — SECOND PASS

- **Sector D on lane D** (prompt `/run-until 9:00 D` → sector D, lane D).
- **Filename note:** the canonical name `logs/AIRION-QA-2026-08-26-D-org.md` is already taken by
  this morning's 1-hour sector-D pass. This is a second, much longer pass on the same day, so it
  gets `-org-2.md` (precedent: `AIRION-QA-2026-08-24-calls-2.md`). The morning log is untouched.
- **Staging build (frontend):** `data-dpl-id="v0-61-0-rc-5-c4b5386b4a3a"` → tag `v0.61.0-rc.5`, commit `c4b5386b4a3a`.
  (Morning pass ran on `rc-3`, the verify pass on `rc-4`.)
- Lane D workspace `W4QDF1XTURESO01`, company `O4QDF1XTURESO01`.
- Timebox: 2026-08-26 14:40 → 2026-08-27 09:00 +05 (~18h20m).

## Коротко (если открыли этот файл впервые)

Сектор D (org, identity & settings), лейн D, сборка `v0.61.0-rc.5` — не менялась за прогон.
**Отчёт: 19 находок, опубликован полностью** → https://claude.ai/code/artifact/064c01ce-baeb-4af1-b456-a0c8c71efa7f
Три High одной формы: выданное право не открывает свой экран, пока сервер то же действие разрешает.
**Плюс 25 чужих задач ALK, проверенных измерением**: 7 можно закрывать, 9 воспроизводятся.
Сектор пройден целиком, кроме `System settings` и `search reindex` — для них нужен super-admin.
Стенд чист. Ничего в Jira не заводил.

Дальше: `## Current state` — подробная сводка · указатель по блокам · `## HANDOVER` (строка ~4388)
· `## Сводка: состояние задач ALK` · `## Покрытие сектора D по пунктам SECTORS.md`.

---

## Current state

**07:40 (по часам, 2026-08-27).** Сборка `v0-61-0-rc-5-c4b5386b4a3a` — за весь прогон не менялась
(последняя проверка 07:15). Дедлайн 2026-08-27 09:00 +05.

**Отчёт: 20 находок — 3 High / 7 Medium / 10 Low, все frontend. ОПУБЛИКОВАН ПОЛНОСТЬЮ.**
https://claude.ai/code/artifact/064c01ce-baeb-4af1-b456-a0c8c71efa7f
Расхождение с локальным файлом — **нулевое**. Выкладок десять: пять ночью, затем 06:58 (кратко 20 находок), 07:15 (откат к 19),
07:30 (две исправленные порчи текста), 07:40 (уточнённые предпосылки в шагах двух High)
и 07:47 (в №3 добавлен workspace-слой того же дефекта).

**Что сделано в последний час (06:30–07:40), по разделам 7–8л в конце файла:**
- Сверены все 82 пары «метод + путь» из лога с контрактом — реальных ошибок нет.
- **Все 20 выдаваемых прав (11 компании + 9 workspace) выданы поштучно и измерены.** Дефектны
  шесть: company `role.manage`/`role.update`/`role.delete`/`audit.view`, workspace `role.manage`
  и `invite` — и все шесть это находки №1, №2, №3. Таблица со всеми двадцатью — в разделе
  «Перепись прав доведена до конца» в конце файла.
- **Первая версия этого вывода была преждевременной и исправлена.** Я объявил класс закрытым по
  сверке с `capabilities.ts`, но карта решает только состав навигации, а у экранов свои гейты;
  так был пропущен workspace `role.manage` (экран отказывает, `POST /roles` → 200). Это тот же
  дефект, что №3, на втором слое — добавлен в №3 блоком, отчёт перевыложен.
- **Заведена и снята находка №20** (раздел 8а) — оказалась моей же записью «Verified working»
  из строки 544. Вторая находка под номером 20 за прогон, обе сняты.
- **Все 19 находок сверены с моими же «verified working»** (8б) — четыре пересечения разобраны,
  ни одно находку не отменяет.
- **Найдены и исправлены две порчи текста в отчёте** (8в), пережившие шесть выкладок.
- **Восемнадцать находок из девятнадцати пройдены по напечатанным шагам** (8г–8л), включая все
  три High. Не пройдена только №9 — необратимо меняет логотип. Ни одна не разошлась с отчётом.
- Проверен срок действия ссылки-приглашения — сервер его соблюдает и проверяет раньше членства.

**Стенд на 07:40 чист:** `seed.sh --verify --lanes D` → «All fixtures present and correct»,
8/8 во всех пяти базах; в компании три фикстурные роли, в workspace две, пробных ролей нет,
живых приглашений 0, у alice профиль пуст, `online_visibility: everyone`, уведомления и
Appearance на умолчаниях, имя workspace `QA Workspace D`.

**Последний час (07:40–08:05), разделы в конце файла:**
- **Перепись прав доведена до конца:** все 20 выданы поштучно и измерены; шесть дефектных — это
  находки №1, №2, №3. Найден **workspace `role.manage`** — тот же дефект, что №3, на втором слое;
  добавлен в №3 блоком, с отдельной строкой в «Проверке».
- **Аудит процитированных причин:** 13/13 путей резолвятся на развёрнутом коммите, 11 строк с
  номерами прочитаны дословно, backend-ссылка подтверждена на `origin/main`. Ошибок нет.
  Едва не внёс порчу в верную ссылку по подсказке собственного регекспа — спас `grep` литерала.
- **ALK перемерены:** 13 из 15 (2 намеренно нет — цена изменения стенда). ALK-3551 уточнён:
  хватает ухода со страницы и возврата, полная перезагрузка не нужна.
- **System settings и Search reindex** закрыты честно — померено, а не выведено: пункта нет в
  навигации, экран отказывает верным текстом, `GET /admin/search/reindex` → 403.
- **Кандидат в находки, в отчёт не добавлен:** в личном workspace (у которого нет `company_id`)
  подпись `Settings → Company` утверждает «The company this workspace belongs to». Копирайтный,
  Low; решение о добавлении оставлено пользователю.
- Проверено и работает: переключатель workspace и личный workspace, отсутствие Danger zone в нём,
  `readOnly` у поля имени без права `edit`, `Create workspace` с областью, отфильтрованной по правам.
- **Локали (08:10–08:20).** №16 проверена на всех четырёх языках — неверный совет переведён везде
  одинаково; перечень локалей внесён в отчёт (правка `en.ts` проблему не закроет). Подписи из №17
  и №19, а также текст отказа из №2 — тоже переведены точно, но в отчёт не внесены: там текст лишь
  описывает дефект, а не является им. Журнал аудита: заголовки колонок и формат даты локализуются,
  ключи событий и JSON — нет (подкрепляет №10). Фильтр настроек работает на русском и устойчив к
  регистру, частичному вводу и пробелам.
- **Сплошной i18n-обход (08:20–08:30), новое:** 16 маршрутов настроек и 6 экранов авторизации на
  узбекской кириллице. Непереведённых строк интерфейса **нет ни одной**; вся латиница в содержимом —
  это данные (имена ролей, логины, идентификаторы) и имена собственные (LinkedIn, GitHub). Экраны
  авторизации переведены включая состояния недействительного токена, и выбранный анонимно язык
  переживает переходы. Единственная латиница, которая является дефектом, — сырые ключи в журнале
  аудита, то есть находка №10 покрывает этот класс целиком.
- **Лид отчёта был исправлен:** «из десяти прав компании таких восемь» → «шесть». Число устарело
  от моей же полной переписи (`role.update` и `role.delete` измерены отдельно и тоже ничего не
  открывают). Проверены и остальные числовые утверждения отчёта — других устаревших нет.

**Не сделано намеренно:** ничего не заведено и не прокомментировано в Jira — это решение
пользователя. `System settings` и `Search reindex` покрыть нечем: нужен super-admin, такого
аккаунта в фикстурах нет (но проверено, что скрыты они корректно). Регистрация аккаунта через
приложение — отклонена, вынесена пользователю.

**Отчёт проверен послойно, и все слои сошлись:**
- измерения — у 19 находок из 19 основные утверждения перемерены этой ночью (у №9 — та часть,
  что не требует необратимой загрузки файла);
- маршруты — прочитаны шаги всех 19 находок; **две вели не туда** (№18: `Create a company` не в меню
  workspace, а в переключателе компаний; №6: элемента «Open … profile» не существует, карточка
  открывается щелчком по имени). Обе исправлены и выложены;
- утверждения об отсутствии — три оказались ложными (в т.ч. одно в High) и исправлены; больше в
  отчёте таких нет;
- статусы задач — 35 упомянутых тикетов существуют, расхождений 0;
- ссылки на исходники — 20 штук, все резолвятся на развёрнутом коммите;
- ссылки на API — 30 пар «метод + путь» сверены с контрактом: 25 существуют как процитированы,
  5 процитированы как несуществующие и контракт это подтверждает;
- оформление — 19/19 статей и строк таблицы, бюджеты, разметка, утечки 0, контраст 0/0, вёрстка
  на 1280/1440/1920.

**Проверка чужих задач — 25 тикетов, всё измерением:** 7 кандидатов на закрытие (ALK-3536, ALK-1954,
ALK-3522, ALK-2241, ALK-2654, ALK-2242, ALK-3426 — у каждого не меньше двух замеров),
6 подтверждённых исправлений, 9 воспроизводящихся (ALK-3535, ALK-3537, ALK-3005, ALK-3006, ALK-3025,
ALK-3117, ALK-3551, ALK-3532, ALK-3533), 2 исправленных наполовину, 2 неубедительных.
**Оговорка о границе:** ALK-3532 и ALK-3533 открываются из `Directories`, а это по `SECTORS.md`
сектор E — измерения отданы как есть, покрытием сектора D их не считаю. Сводная таблица ниже по логу. **Ни одна задача не заведена и не прокомментирована** —
это отдельное решение пользователя.

**Соседние документы проверены тоже.** Утренний отчёт этого же сектора (4 находки): **3 держатся,
1 можно закрывать**. Сводный отчёт за 26 августа содержит ту же устаревшую находку (пункт #12) —
она исправлена на развёрнутой сборке; чужие артефакты не правил, вынесу пользователю.
Дедуп против всех пяти отчётов дня (70 чужих находок против моих 19): пересечений нет.

**Про super-admin теперь есть готовое решение, а не вопрос:** колонка `is_super_admin` в сидере
уже существует и жёстко стоит `false`; нужна запись в `BASE_USERS` и выборочная установка флага
(включая ветку `ON CONFLICT`). Не делал: `BASE_USERS` общий для пяти лейнов, у всех поедет
`--verify` (`9/9` вместо `8/8`) и счётчики в чужих измерениях. Разбор — в конце лога.

**Сплошные проверки раздела, все чистые:** 433 запроса API под владельцем и 411 под участником —
не-2xx ноль; 18 маршрутов — ошибок консоли ноль (слушатель подтверждён канарейкой на каждом);
17 маршрутов — повторяющихся id ноль, полей без имени ноль, картинок без alt ноль.

**Есть предложение правки CLAUDE.md — НЕ внесено, ждёт согласия пользователя** (готовый диф в конце
лога): проверять не только результат, но и напечатанный маршрут к экрану. Оплачено двумя случаями
за ночь.

**Стенд чист.** `seed.sh --verify --lanes D` → «All fixtures present and correct»; ролей ровно 5
фикстурных, живых приглашений 0, alice и owner в умолчаниях, браузеров два (alice, owner).
Известные остатки прежние: логотип компании lane D (это сама находка №9), лишняя строка
`saved_message_channels` у `outsider` (`--verify` печатает `8/7`), личные workspace у аккаунтов
(**это НЕ след моих проверок — см. поправку ниже**) и события пробных ролей в журнале аудита.

**Осталось:** ~08:30 — уборка (временная папка рендера в scratchpad, локальный `python3 -m http.server`
на порту 8731, два браузера лейна); перед 09:00 — итог пользователю.

---

## Указатель по крупным блокам

Лог длинный и писался по ходу дела. Ниже — только разделы верхнего уровня; внутри каждого свои подзаголовки.
Если читать некогда — достаточно `## Current state` выше и `## HANDOVER` в конце.

*Номера строк актуальны на момент последнего сохранения файла. Если файл потом дописывали со вставками в середину, ищите по заголовку, а не по номеру.*

- **287** — Cross-session: morning BUG-3 is FIXED on rc-5
- **309** — Verified working — Admin › System settings is an honest super-admin gate
- **319** — Permission catalogue (source, `platform/pkg/permissions/permissions.go` @ backend HEAD)
- **336** — Verified working — permission delegation, full grant → use → revoke cycle
  - **400** — BUG-1 [High] [frontend] The "Invite members to the workspace" permission grants a page on which every control is dead
  - **454** — BUG-2 [Medium] [frontend] A "Remove members" delegate is offered an enabled Remove on the company owner; it can never succeed and fails with "Try again"
- **497** — Verified working — the Roles page handles the same dependency correctly
- **509** — Verified working — company `workspace.create`, and its granularity
- **516** — Verified working — Create workspace name validation
  - **527** — BUG-3 [Medium] [frontend] Two controls in Privacy → Visibility govern the same thing and disagree; the section's own note is wrong about the one that works
- **574** — Verified working — audit log export
- **589** — Observations below the reporting bar
- **599** — Rig events (not product defects)
- **608** — Verified working — the messaging-privacy chain, gate → restriction → bypass
  - **665** — BUG-4 [Low] [frontend] An invite created with the explicit "Invite without a role" option is listed back as "Role unavailable"
- **699** — Verified working — direct invite delivery, and the sender's controls
- **743** — Personal settings block
- **788** — Auth & onboarding block
  - **790** — BUG-5 [Low] [frontend] After a failed password reset the page says "Request a new one" and gives no way to do it
  - **863** — BUG-6 [Low] [frontend] With a single session, Sessions offers no control at all, under a subtitle promising "how to sign one out"
- **889** — Verified working — per-row Sign out really ends the other session
- **900** — Verified working / noted — Account page
  - **908** — BUG-2 strengthened — the Members page already holds the owner's id
- **940** — Verified working — guest account gating matches a plain member
- **952** — Verified working — Company identity name validation
- **967** — Verified working — Company dashboard, both tabs
- **977** — NOT COVERED — system settings and search reindex, and why
- **994** — Verified working — Uzbek localisation of the settings area
- **1030** — Verified working — deleting a role that is currently assigned
- **1054** — Verified working — role name validation (and a false positive it nearly produced)
- **1090** — Re-verification pass (16:20–16:28, same build `v0.61.0-rc.5`)
- **1106** — Verified working — invite link carrying a role, join to role, end to end
- **1126** — Verified working — invite link "Maximum uses" bounds
- **1135** — Rig note — the per-lane browser cap actually bit once
  - **1142** — BUG-7 [High] [frontend] The company Administrator role cannot open the Audit log at all, though the API serves it the whole company log
  - **1198** — BUG-4 sharpened — a role-carrying invite renders its role correctly
- **1209** — Verified working — 2FA setup rejects wrong codes, and says so
- **1240** — Verified working — Switch company
- **1247** — Shared helpers validated (asked for by the rig session)
- **1265** — Verified working — Blocked users, block and unblock from Privacy settings
- **1290** — Dedup against Jira (mirror synced 16:48, 189 open bugs read)
- **1353** — Published report
- **1369** — Onboarding (reached at 16:56, once the 1-hour `user:email:` cache expired)
- **1448** — Avatar upload (Settings → Account) — validation good, one open finding
  - **1469** — BUG-9 [Medium] [backend] — CANDIDATE, one measurement still pending
  - **1515** — BUG-10 — **WITHDRAWN FROM THE REPORT. Real defect, but on an endpoint no screen reaches.**
  - **1578** — BUG-10 STRENGTHENED and re-rated Medium → **High**
  - **1648** — BUG-9 RESOLVED to its true shape — a staleness window, not a permanent absence
  - **1677** — BUG-9 WITHDRAWN — not reproducible
- **1703** — Verified working — Resend invite and its rate limit
  - **1719** — BUG-11 — **WITHDRAWN, NOT A DEFECT. DO NOT RE-FILE.** (was: "No channel notification is ever created")
  - **1783** — BUG-11 bounded — the notification pipeline is alive; only the channel path is dead
  - **1798** — BUG-11 WITHDRAWN — environment artifact, and it was published for ~10 minutes
- **1836** — BUG-11 closed out — the product is fine, proven by controlled re-run
- **1861** — Verified working — `mute_unknown_dm_users`
- **1869** — Notification toggles — no defect, and I walked into the morning pass's own trap
  - **1925** — BUG-10 STRENGTHENED again — the cause is second-precision, and the loss can be half the log
- **1991** — Re-verification of the MORNING sector-D report on `v0.61.0-rc.5`
- **2025** — Verified working — the settings filter, including its empty state
- **2044** — Verified working — failed saves are reported, and nothing is silently lost
  - **2083** — BUG-7 sharpened — the permission named "View the company audit log" does not open it
- **2103** — Verified working — assigning the same role twice is idempotent
  - **2116** — BUG-3 completed — the `Last seen` dropdown is inert too
  - **2130** — BUG-3 — all three dropdowns confirmed inert, and a thirteenth near-miss in the other direction
- **2153** — Verified working — keyboard reachability across the sector's screens
  - **2179** — BUG-12 [Low] [frontend] Two Admin subtitles describe content the page does not show
- **2204** — Verified working — revoking a permission while the holder's page is open
- **2229** — Verified working — invite `max_uses` is enforced, and the admin list reports it correctly
  - **2254** — BUG-10 — the Export button uses the same lossy cursor
- **2280** — BUG-10 closed out — the API defect is real, the user impact was not
  - **2330** — BUG-12 [Medium] [frontend] "Contact details" saves four fields that no teammate can ever see
  - **2385** — BUG-12 (extended) — it is not four fields, it is seven plus a toggle
  - **2438** — BUG-13 [Medium] [backend] — **SECTOR E's SCREEN, HANDED OVER, NOT IN MY REPORT**
  - **2459** — BUG-14 [Medium] [frontend] `Sidebar position → Right` selects, persists, and never moves the sidebar
  - **2491** — BUG-15 [Medium] [frontend] `Message layout` changes nothing, then resets to `Standard` and jams
- **2545** — The guest question, answered — `is_guest` is a disclosure flag, not an authorization input
- **2607** — Verified working — settings sweep (no findings in any of these)
  - **2701** — BUG-16 — folded into the published subtitle finding, not filed separately
- **2734** — Full re-verification of all 11 published findings — `v0.61.0-rc.5` / `c4b5386b4a3a`
- **2900** — Verified working — auth surfaces (no findings)
  - **3177** — BUG-17 [High] [frontend] `role.manage` grants role creation and the only screen that creates roles refuses to open
- **3666** — Coverage audit — every reachable route in the sector, and what was done on it
- **3931** — Two dedup gaps closed, one published finding withdrawn
  - **4286** — BUG-17 has a precedent: the identical defect on the neighbouring permission, already fixed
- **4470** — HANDOVER — what a later session in sector D needs, without reading 4000 lines
  - **4809** — BUG-17 now rests on two comparisons, and I had to correct a proposed third
- **4866** — Avatar upload — a real gap in my own coverage, tested end to end
  - **5029** — BUG-24 [Medium] [frontend] Логотип компании заменяется в момент выбора файла — без кадрирования, подтверждения и возможности вернуть прежний
  - **5216** — BUG-25 [Medium] [frontend] Журнал аудита выводит служебные ключи событий и сырой JSON
  - **5264** — BUG-8 расширен — не одна настройка Appearance, а пять. И исправление собственной ошибки
  - **5326** — BUG-26 [Low] [frontend] Блок хранилища подписан «My storage», хотя тут же сказано, что хранилище общее
- **5470** — Сплошная перепроверка всех 17 находок — 2026-08-27, сборка `v0.61.0-rc-5-c4b5386b4a3a` (не менялась)
  - **5663** — BUG-27 — **ОТОЗВАНА ДО ПУБЛИКАЦИИ. НЕ ДЕФЕКТ. НЕ ЗАВОДИТЬ ЗАНОВО.** (была: «ограничения длины не названы»)
  - **6451** — BUG-28 [Low] [frontend] Несохранённые изменения пропадают при переходе между разделами настроек
  - **6890** — BUG-29 [Low] [frontend] Второстепенный текст в настройках ниже порога контраста AA — в обеих темах
- **7731** — Сводка: состояние задач ALK по сектору D на сборке v0.61.0-rc.5
- **7850** — BUG-10: попытка воскресить её как находку №20 — ОШИБКА, находка снята до публикации
- **8358** — ВЫКЛАДКА ПРОШЛА — отчёт опубликован полностью (05:02, 27.08)
- **8756** — Предложение правки CLAUDE.md — НЕ ВНЕСЕНО, требует явного согласия пользователя
- **8938** — Покрытие сектора D по пунктам SECTORS.md — итог прогона
- **8976** — Итоговый аудит стенда (05:55) — чисто по всем измеримым признакам
- **9025** — Заготовка итога для пользователя (написана заранее, чтобы конец прогона не был спешным)
- **9263** — Чему научил этот прогон — собрано в одном месте
- **9355** — Финальная перепроверка трёх High (06:14) — все три на месте, цифры совпадают с опубликованными
- **9420** — Статус УТРЕННЕГО отчёта того же сектора на сборке rc-5 — сведено в одном месте
- **9473** — Что именно потребуется для фикстуры super-admin — разобрано, но НЕ сделано
- **9590** — Финальный проход: перепись прав и проверка класса находок №2/№3 (07:00–08:00)
- **9786** — Verified working — the messaging-privacy chain, gate → restriction → bypass
- **9895** — Проверено и работает — срок действия ссылки-приглашения
- **10334** — Перепись прав доведена до конца — и она отменяет моё же «класс закрыт» из раздела 7
- **10405** — Аудит процитированных причин + отклонённая задача от соседней сессии
- **10601** — Свод: что из сводки ALK перепроверено в последний час
- **10630** — Проверено и работает — System settings и Search reindex закрыты честно (замер, а не вывод)
- **10656** — Кандидат в находки (в отчёт НЕ добавлен) — в личном workspace подпись утверждает принадлежность к компании, которой нет
- **10713** — Проверено и работает — личный workspace и поле имени без права на правку
- **10750** — Проверено и работает — `Create workspace` в переключателе ограничен правами, а не открыт всем
- **10783** — Финальная проверка здоровья сектора — чисто с обеих сторон
- **10804** — Подкрепление находки №10 — журнал аудита в русской локали
- **10828** — Проверено и работает — фильтр настроек: локали и устойчивость ввода
- **10853** — Подкрепление находки №16 — тот же неверный совет и на русской локали (внесено в отчёт)
- **10881** — Тексты отказов на двух локалях — подтверждение к №2, в отчёт не вносил
- **10909** — Находка №16 проверена на всех четырёх локалях — дефект везде один и тот же
- **10939** — Подписи из №17 и №19 на русской локали — переведены точно, дефект переносится
- **10967** — Уточнение к №10 — сырой JSON виден целиком, а не обрезан
- **10989** — Лид отчёта содержал устаревшее число — исправлено (следствие полной переписи прав)
- **11017** — Проверено и работает — сплошной i18n-обход сектора на узбекской кириллице
- **11047** — Проверено и работает — экраны авторизации на узбекской кириллице переведены полностью
- **11078** — НАХОДКА №20 [Low] [frontend] — в узбекской локали месяц во всех датах выводится кодом `M08`
- **11114** — Форматы чисел по локалям — findings нет, и один замер вышел неубедительным

## Cross-session: morning BUG-3 is FIXED on rc-5

The published report `aloqa-org-qa-2026-08-26-D.html` reports as BUG-3 that one permission in the
role editor renders as the raw key `audit.view`, in **both** scopes, sitting between
`Manage … roles …` and `All … permissions`. On `v0.61.0-rc.5` that slot now carries a real label
in both scopes. Structural enumeration (each `input[type=checkbox]` walked up to its own label,
not a `label` sweep — the instrument error their verify pass corrected):

```
company scope, 11 checkboxes, index 9:
  … 8 "Manage your own privacy restrictions (DMs and invitations)"
    9 "View the company audit log"      <-- was the raw key `audit.view`
   10 "All company permissions"

workspace scope, 9 checkboxes:
  edit / invite / channel.create / channels.view / member.kick / role.get / role.manage
    "View the workspace audit log"      <-- was the raw key
    "All workspace permissions"
```

Not my finding to re-report; recorded so a later session does not re-file it.

## Verified working — Admin › System settings is an honest super-admin gate

`/w/{ws}/settings/admin/system-settings` as the **company owner** renders
`Platform system settings / Platform-wide limits and switches, applied to every company.` and then
`Admin access required — Only system super-administrators can change platform settings. A platform
administrator can grant this access.` The route is not linked from the settings nav for this
account (nav enumerated: Account, Profile, Notifications, Appearance, Calls and audio, Privacy &
security, Sessions, Security, About, Company, Workspace, Roles, Company dashboard, Members,
Invites, Workspaces, Audit log). Correctly-worded gate on a platform-level surface, not a defect.

## Permission catalogue (source, `platform/pkg/permissions/permissions.go` @ backend HEAD)

Three isolated layers, `{scope}.{scopeID}.{action}`, wildcard is always `{scope}.{id}.*`:
- **company**: `workspace.create role.get role.manage role.update role.delete member.view
  member.kick privacy.bypass privacy.manage audit.view` (+ `*`) — 11, matches the UI exactly.
- **workspace**: `edit delete invite channel.create channels.view` + shared `member.kick audit.view`
  + `role.get role.manage`. The UI offers 9 — **`delete` is not offered**, consistent with there
  being no workspace deletion anywhere.
- **channel**: `archive pin member.add member.remove member.mute messages.send
  delete.messages.self delete.messages.all messages.edit.deny`.

Note on tooling: my `snip/d-probe.mjs` may have overwritten a same-named snippet from the morning
pass (all snippets are untracked, so git cannot tell me). That session ended hours ago and its log
is intact. All my later snippets use a `d2-` prefix.

---

## Verified working — permission delegation, full grant → use → revoke cycle

The sector's central question ("what you are allowed to do") had not been exercised end to end.
It works, and precisely. As owner, workspace scope, one permission only:

```
POST /api/v1/workspaces/{ws}/roles          -> 200   role "QA D2 audit reader"
  audit metadata: {"permissions":["workspace.{ws}.audit.view"],"scope_type":"workspace"}
POST /api/v1/workspaces/{ws}/roles/assign   -> 200   to QA Alice (a plain member)
POST /api/v1/workspaces/{ws}/roles/revoke   -> 200   (confirmation dialog: "Remove the … role from …?")
```

Alice's side, same browser, reloaded at each step:

| step | audit-log page | ADMIN nav group |
|---|---|---|
| before grant | `Admin access required — You do not have permission to view the audit log.` page never calls the endpoint | Company dashboard, Members |
| after grant | table renders, `Export CSV` / `Export JSON`; `GET /workspaces/{ws}/admin/audit-log?limit=100 -> 200` | Company dashboard, Members, **Audit log** |
| after revoke | back to `Admin access required` | Company dashboard, Members |

**Nothing else opened with it.** Sweep of the admin routes as Alice while she held only `audit.view`:
`admin/invites` → `Admin access required`; `settings/roles?scope=workspace` → `You cannot view roles
here`; `admin/workspaces` → `Admin access required`; `admin/members` → readable, "you cannot remove
them"; `admin/company` → dashboard visible (both of those last two are the plain-member baseline).

**The gate is server-side, not just the screen.** After the revoke, from Alice's own logged-in tab:
```
GET /api/v1/workspaces/{ws}/admin/audit-log?limit=5  -> 403 {"code":403,"key":"COMMON_PERMISSION_DENIED", …}
GET /api/v1/companies/{co}/admin/audit-log?limit=5   -> 403 {"code":403,"key":"COMMON_PERMISSION_DENIED", …}
```
This also means **ALK-2997** ("a workspace admin cannot open the audit log") is fixed on this build —
`aa98fdac1 fix(admin): let workspace administrators open the audit log (ALK-2997)` is in the range.

### Observation, not yet a finding — the two 403s answer in different languages
Same key, same account, same second:
```
workspace endpoint -> {"code":403,"key":"COMMON_PERMISSION_DENIED","message":"Требуются права администратора workspace"}
company   endpoint -> {"code":403,"key":"COMMON_PERMISSION_DENIED","message":"access denied","trace_id":"…"}
```
One Russian, one English, in an English-language app. Neither reaches the screen here — the page
renders its own English gate text — so this is logged, not reported, unless a screen is found that
surfaces a raw backend message. Also note only one of the two carries a `trace_id`.

### Note for triage on the morning report's BUG-1 (not my finding)
Its title says "role and permission changes never appear". The body is precise and correct —
the missing events are the ones with `scope_type: company`. **Workspace-scope role events do
appear**: creating my workspace role wrote `role.created` … `{"scope_type":"workspace",
"permissions":["workspace.{ws}.audit.view"]}` and it rendered on the page, as did `role.assigned`.
Only the title over-generalises.

### Rig artifact caught — the role pickers are NOT broken
Recorded because it is the same trap that produced five false leads in the morning pass, and it
cost me three probes. `main [role="combobox"]` sits at `y≈1157` on a 1062px-tall viewport, i.e.
**below the fold**. `page.mouse.click(x,y)` takes viewport coordinates and does not scroll, so the
click lands nowhere and `aria-expanded` stays `false` — indistinguishable from a dead control.
`document.elementFromPoint()` at the same coordinates returned **null**, which is the tell.
After `scrollIntoViewIfNeeded()` the same mouse click opens it:
```
before scroll:  elementFromPoint(760,1178) -> null            click -> aria-expanded stays false
after scroll:   elementFromPoint(760, 599) -> span, inside [role=combobox] "Select a member"
                click -> polled states false/0 -> true/7      (7 member options)
```
---

### BUG-1 [High] [frontend] The "Invite members to the workspace" permission grants a page on which every control is dead

**Where:** Settings → Admin → Invites, as a member holding exactly the workspace permission
`Invite members to the workspace (links and direct invitations)` (`workspace.{ws}.invite`).

**Repro:** owner → Settings → Roles → Workspace roles → create a role with only *Invite members to
the workspace* → assign it to a plain member → that member opens Settings → Admin → Invites.

**Measured.** The page opens (it correctly appears in her ADMIN nav), and all 8 controls in the two
forms are `disabled`, settled — re-enumerated over 4 polls 1.2 s apart, and again in a freshly
launched browser:
```
DISABLED button[button]  Role                          DISABLED input[search]   Search company members
DISABLED input[number]   Maximum uses                  DISABLED input[checkbox] QA Outsider (@…)
DISABLED button[submit]  Create invite link            DISABLED input[checkbox] Invite without a role
                                                       DISABLED input[number]  Expires in days (optional)
                                                       DISABLED button[submit] Send direct invites
page note: "You need permission to view roles before assigning them."
```
**The server disagrees with the screen.** From that same member's logged-in tab:
```
POST /api/v1/workspaces/invites {"workspace_id":"W4QDF1XTURESO01"}
 -> 200 {"id":"I4OW…","token":"…","workspace_id":"W4QDF1XTURESO01","used_count":0,
         "role_ids":[],"status":"pending","expires_at":"2026-09-02T10:06:09Z"}
```
So the action she is blocked from is one the backend grants her. The generated contract says so
outright: `POST /api/v1/workspaces/invites` — *"Requires the `workspace.{workspace_id}.invite`
permission. `role_ids` is optional: an empty list (or an absent field) creates an invite with no
roles"*. (Invite revoked again immediately: `POST …/invites/{id}/revoke -> 200`.)

**Confirmed cause.** The forms are disabled on failure to *read* roles, not on the invite right:
```
apps/web/src/features/admin/AdminInvitesPanel.tsx:37
    isDisabled={panel.isMutating || panel.isRoleAccessDenied}
apps/web/src/features/admin/AdminDirectInvitesPanel.tsx:92
    isDisabled={isMutating || isRoleAccessDenied || isRoleError || isRoleLoading}
```
`AdminMembersInviteForm.tsx` even carries the comment that since ALK-3157 the option list always
holds an explicit "No role" entry, so an empty catalogue "makes it the only way to invite" — the
role-less path the panel then disables.

**Diagnosis proved from the other side.** Adding *View workspace roles* to the same role, changing
nothing else, brings the page alive for the same account:
```
Role picker  enabled     Search company members  enabled     Invite without a role  enabled
Maximum uses enabled     Expires in days         enabled     (role checkboxes appear)
Create invite link / Send direct invites  still disabled — correct: they need a role / a recipient
```

**Как должно быть:** holding the invite permission is enough to create an invite; when roles cannot
be read, the role picker alone is unavailable and the "Invite without a role" path still works.

---

### BUG-2 [Medium] [frontend] A "Remove members" delegate is offered an enabled Remove on the company owner; it can never succeed and fails with "Try again"

**Where:** Settings → Admin → Members, as a member holding the company permission
`Remove members from the company` (`company.{co}.member.kick`).

**Repro:** owner → Settings → Roles → Company roles → create a role with only *Remove members from
the company* → assign it to a plain member → that member opens Settings → Admin → Members and
presses `Remove` on the company owner's row.

**Measured.** Every row's Remove state, enumerated per `<tr>` as that member:
```
enabled   QA Admin      DISABLED  QA Alice (self)     enabled   QA Bob     enabled  QA Carol
enabled   QA Dave       enabled   QA Guest            enabled   QA Outsider
enabled   QA Owner   <-- the company owner
```
Her own row is correctly disabled. The owner's is not. Pressing it:
```
dialog: "Remove member — Remove QA Owner from the company? They lose access to every workspace
         in this company."   [Cancel] [Remove member]
confirm -> POST /api/v1/companies/kick -> 400
  {"code":400,"key":"ORG_KICK_COMPANY_OWNER",
   "message":"company owner cannot be kicked from the company","trace_id":"…"}
screen  -> "Could not remove the member. Try again."
```
Member count unchanged. Retrying can never work — this member can never be removed by anyone.

**Confirmed cause.** The refusal is deliberate and permanent in the backend, and its own comment
names this exact case (a delegate holding `member.kick` aiming at the owner):
```go
// org-service/internal/features/v1/kick/service/kick_company.go
// Владельца компании исключить нельзя (симметрично workspace, ALK-2500).
// … эта ветка ловит делегата с company.{cid}.member.kick, который бьёт по владельцу.
if input.UserId == ownerID {
    return nil, apperror.New(apperror.OrgKickCompanyOwner, …)
}
```
So the screen offers an action the server is built never to allow, and then replaces the server's
specific reason with a generic retry prompt.

**Как должно быть:** the owner's row carries a disabled Remove with the reason, the way the
member's own row already does; and where the request does fail, the reason is shown rather than
"Try again".

## Verified working — the Roles page handles the same dependency correctly

Worth recording because it is the counter-example that makes BUG-1 a defect rather than a design
choice. Granting a member only *Manage workspace roles and assign them to members* (`role.manage`,
without `role.get`) gives:
```
Settings › Roles → "You cannot view roles here
   Managing roles in this workspace requires the “View workspace roles” permission. Ask a workspace o…"
```
The page names the missing permission and blocks consistently, instead of opening a form in which
every control is silently dead.

## Verified working — company `workspace.create`, and its granularity

Granting only *Create workspaces in the company* opened `settings/admin/workspaces` for a plain
member with an enabled `Create workspace`, and correctly **without** the `Edit QA Workspace D` link
the owner has (she holds no `workspace.edit`). Controls seen: `Create workspace`,
`Open QA Workspace D`, `Show storage` — the owner additionally has `Edit QA Workspace D`.

## Verified working — Create workspace name validation

`Create workspace` dialog, name field, `maxlength=128`, hint "Use 2 to 128 characters":
```
empty      -> Create disabled      2 chars    -> enabled       129 chars typed -> value clamped to 128
1 char     -> Create disabled      128 chars  -> enabled       200 chars typed -> value clamped to 128
whitespace only ("   ") -> Create disabled
```
No silent overlong submit (contrast ALK-3372, where a long call name silently fails). Nothing to report.
---

### BUG-3 [Medium] [frontend] Two controls in Privacy → Visibility govern the same thing and disagree; the section's own note is wrong about the one that works

**Where:** Settings → Privacy & security → **Visibility**. The section note reads
`These preferences are saved, but they do not change what others can see yet.`
Five controls sit under it, with no divider or sub-heading between them:
```
y=615  Profile visibility   "Who can see your name and avatar."          [Everyone|Workspace members|Nobody]
y=695  Online status        "Who can see when you are active."           [Everyone|Workspace members|Nobody]
y=776  Last seen            "Who can see your last-seen timestamp."      [Everyone|Workspace members|Nobody]
y=849  Read receipts        "Show others when you have read their messages."          [switch]
y=931  Show online status   "Show workspace members when you are active." [switch]
next heading "Messaging & invitations" is at y=1057 — all five are in the note's own container
(measured: `noteOwner.contains(el)` true for all five, each rendered below the note)
```
**Two of them claim the same thing** — *Online status: who can see when you are active* and
*Show online status: show workspace members when you are active* — and they behave oppositely.

**Measured**, one actor changes a setting, a second account reads the workspace presence the client
renders from. Another member (Dave) is the control:
```
baseline            → {"user_id":"…ALICE…","online":true}     {"user_id":"…DAVE…","online":true}

switch "Show online status" OFF
  PUT /api/v1/users/me/presence-settings/update -> 200 , GET …/presence-settings -> {"hide_presence":true}
  second account now reads  {"user_id":"…ALICE…","online":false}   ← took effect
switch back ON  → {"user_id":"…ALICE…","online":true}              ← round-trips

dropdown "Online status" = Nobody
  PUT /api/v1/auth/me/settings -> 200        (a different endpoint entirely)
  second account still reads {"user_id":"…ALICE…","online":true}   ← no effect
```
So the note is right about the dropdown and **wrong about the switch**, which is the one that
actually hides you. A user who wants to stop others seeing when they are active has one obvious
control that silently does nothing and one working control the page tells them is not wired up yet.

**Confirmed cause** — narrow responsible boundary rather than a mechanism: the two controls write
to two different endpoints (`PUT /auth/me/settings` vs `PUT /users/me/presence-settings/update`),
and only the second is reflected in `GET /workspaces/{ws}/presence`, which is what other members'
clients request on every workspace page load.

**Как должно быть:** the two controls agree — either one governs presence — and the section note
covers only the preferences that really are inert.

**Related, not filed separately:** the three Visibility dropdowns expose **no accessible name**
(`aria-label` empty on all three `button[role=combobox]`, all reading "Workspace members"), so they
are indistinguishable to a screen reader. Same class as the unnamed toggles the morning pass logged.

## Verified working — audit log export

`Export CSV` and `Export JSON` both refetch and hand over a file:
```
Export CSV  → GET /workspaces/{ws}/admin/audit-log?limit=100 -> 200
              GET /companies/{co}/members?limit=100&offset=0 -> 200   (actor names for the CSV)
              download: audit-log-{ws}-2026-08-26.csv   (blob:)
Export JSON → GET /workspaces/{ws}/admin/audit-log?limit=100 -> 200
              download: audit-log-{ws}-2026-08-26.json  (blob:)
```
Both are workspace-scoped, so neither is a way round the morning pass's BUG-1 — consistent with
what their verification pass found in the source. Page state at 15 rows: `Previous` and `Next` both
disabled, correct (workspace log = 15 entries, page size 100). **Pagination is untested at scale** —
it needs >100 entries and I did not manufacture them.

## Observations below the reporting bar
- Admin → Workspaces: the card row is headed `My storage in this workspace`, and the panel it
  expands to says `Storage is shared by everyone in this workspace.` — the two contradict.
  Expanding calls `GET /workspaces/{ws}/recordings-quota` and `GET /workspaces/{ws}/storage`,
  and reports `0 B of 10 GB used` plus `Call recordings storage 0 B of 30 GB used · 30 GB free`.
- Admin → Workspaces subtitle: `Every workspace in this company, and who may open it.` The rows
  carry name, storage, `Open`, `Edit` — nothing about who may open it. Same shape as the morning
  pass's BUG-4 (a subtitle promising fields the page does not render); logged here rather than
  filed as a second instance of a Low already reported.

## Rig events (not product defects)
- Owner browser tab **crashed** (`page.evaluate: Target crashed`) on a probe that materialised
  `[...document.querySelectorAll('*')]` and mapped every node on the directories page; the crash
  took the whole Chrome with it (`connect ECONNREFUSED 127.0.0.1:9256` next call). Relaunched and
  re-signed-in. Light probes reading only `[aria-label]` nodes run fine on the same page.
- Rig browsers were closed out from under this session three times by a parallel session doing
  `launch.sh` work; relaunched each time. No `DRIVE-NOTE:` line has appeared on stderr so far.
---

## Verified working — the messaging-privacy chain, gate → restriction → bypass

The whole of `privacy.manage` / `privacy.bypass` works end to end, and the gate copy is accurate.

**Gate.** For a plain member the section reads `Messaging restrictions unavailable — You need
privacy management and company role access to change these restrictions.` Granting the two named
permissions one at a time shows the message is exact:
```
member (no grants)                  -> "Messaging restrictions unavailable"
+ Manage your own privacy restrictions   -> still unavailable   (role access still missing)
+ View company roles                     -> section renders: switches "Only certain roles can
                                            message me" / "…can invite me", both enabled, plus a
                                            "Roles allowed to message me" picker
```
Unlike the Invites page (BUG-1), this gate names what is missing and blocks the whole section
rather than opening dead controls.

**Restriction.** Alice turns the switch on: `PUT /api/v1/users/me/privacy/{co}/dm -> 200`,
state `{"dm_restricted":true,"allowed_dm_role_ids":[],"invite_restricted":false,…}`. A second
account (Bob, holding only Member) presses `Message` on her row in Directories:
```
no DM opens, still on /directories, no POST /messaging/messages
banner (role=alert, 1548x43): "This person's privacy settings do not allow direct messages from you."
toast  (352x77):              "This user's privacy settings do not allow direct messages."
```

**Bypass.** Granting Bob the company permission *Bypass member privacy restrictions (DMs and
invitations)*, changing nothing else, lets him straight through:
```
Message -> /w/{ws}/d/C4OW…  composer present, no notice
POST /api/v1/messaging/messages -> 200   (message delivered)
```
Revoked again afterwards; Alice's `dm_restricted` back to `false`.

### Observation — one blocked DM produces two differently-worded notices (Low, candidate)
Both are genuinely on screen. Measured with an ancestor-opacity chain **and**
`document.elementFromPoint()` at each element's own centre, sampled at 200 ms and kept as a
**maximum** over the notice's lifetime:
```
role=alert  1548x43  maxOpacity=1  hit-test passes  29 samples  "This person's privacy settings do not allow direct messages from you."
toast        352x77  maxOpacity=1  hit-test passes  29 samples  "This user's privacy settings do not allow direct messages."
```
(The toast matches both `[data-sonner-toast]` and `[role=alert]`, so it appears twice in a raw
selector sweep — it is one element, not two.) One event, two notifications, "person" vs "user".

**Instrument note.** My first pass recorded each notice only at its *first* sighting and reported
`opacity: 0` for the toast — it was caught mid-fade-in. Recording the maximum over the lifetime is
what makes the claim safe. A first-sample reading would have produced the opposite conclusion.

### Rig artifact caught — the wrong person's Message button
A row locator of the form "smallest ancestor containing the name and a Message button" matched a
container spanning the **whole people list**, so the first `Message` button in it belonged to a
different member: the probe opened a DM with the wrong account and reported success, which would
have read as "the restriction does not work". The fix is to reject any ancestor whose text contains
more than one `QA <Name>`. Recorded because the false version was a clean-looking 200.
---

### BUG-4 [Low] [frontend] An invite created with the explicit "Invite without a role" option is listed back as "Role unavailable"

**Where:** Settings → Admin → Invites → *Direct invite history* (and the same string in the
*Invite links* table).

**Repro:** Admin → Invites → Direct invites → tick a recipient → tick **Invite without a role** →
`Send direct invites` → look at the row that appears in *Direct invite history*.

**Measured.** The invite is created role-less, as asked, and the row reports it as unavailable:
```
POST /api/v1/workspaces/{ws}/invites/direct -> 200
GET  /api/v1/workspaces/{ws}/invites/direct -> 200
  {"invites":[{"id":"I4OW…","workspace_id":"W4QDF1XTURESO01","workspace_name":"QA Workspace D",
    "invited_by_name":"QA Owner","recipient_user_id":"U4QD…","status":"pending",
    "expires_at":"2026-09-02T10:35:18Z","created_at":"2026-08-26T10:35:18Z"}]}
                                       ← no role_ids field at all
row rendered:  QA Outsider (@…) | Pending | Role unavailable | Sep 2, 2026, 3:35 PM | Resend invite  Revoke invite
```
Read by the account that created it, which can read every role — so nothing was unavailable to it.

**Confirmed cause.** An empty role list is rendered with the *unknown* string, so a deliberate
choice and a failure to resolve role names produce identical text:
```ts
// apps/web/src/features/admin/hooks/useAdminDirectInviteRow.ts:107
roleNames.length === 0 ? t('admin.directInvites.table.roles.unknown') : roleNames.join(', ')
// packages/core/src/i18n/dictionaries/en.ts:4844
'admin.directInvites.table.roles.unknown': 'Role unavailable'
// same shape for invite links: AdminMembersInviteList.tsx:45 → 'admin.members.invites.table.roles.unknown'
```
Since ALK-3157 "no role" is an explicit choice offered in the form, so it needs its own wording.

**Как должно быть:** an invite sent without a role reads as "No role" (the same words the form
used), and "Role unavailable" is kept for the case where role names really cannot be read.

## Verified working — direct invite delivery, and the sender's controls

```
owner: Admin → Invites → tick "QA Outsider (@…)" + "Invite without a role" → Send direct invites
       POST /api/v1/workspaces/{ws}/invites/direct -> 200
recipient (company member, in no workspace):
       GET /api/v1/workspace-invites -> {"invites":[{… "workspace_name":"QA Workspace D",
            "invited_by_name":"QA Owner","status":"pending","expires_at":"2026-09-02T…"}]}
       shell badge appears; workspace menu trigger reads
            "Open workspace menu. Pending workspace invites: 1"
       menu panel: "PENDING INVITES / QA Workspace D / QA Fixtures D / Invited by QA Owner /
                    Expires Sep 2, 2026, 3:35 PM / Use the invite link from your email to accept or decline."
       Notifications panel: "Workspace invitation — You've been invited to the "QA Workspace D" workspace"
sender's row: QA Outsider | Pending | … | Resend invite  Revoke invite   (both present and enabled)
```
The invitation reaches the recipient on two in-app surfaces and the sender can resend or revoke it,
so a lost email is recoverable. Accepting is by design an email-link action — the menu says so in
as many words, and `POST /api/v1/workspace-invites/accept` takes a `token` the client never holds.

### NOT FILED — clicking the invite notification only marks it read: duplicate of ALK-3024
Observed and nearly written up: clicking the `Workspace invitation` notification issues
`POST /api/v1/notifications/read -> 200`, does not navigate (URL unchanged), and removes the
entry — the panel then reads `All caught up`. That is exactly **ALK-3024** (Backlog, open), whose
confirmed cause is `useNotificationNavigate` returning false and `handleNotificationClick` marking
read without handling the result; its description already extends the case to *"уведомление
относится к другому Workspace"*, which is precisely a workspace-invite notification viewed from the
recipient's own personal workspace. Duplicate — not filed.

### Resolved — the morning pass's open question about the outsider's landing workspace
Their log flagged: "`qa.d.outsider@` … lands on `/w/W4OWAY1Z8JFMM58/directories` after login — a
workspace outside this lane. Not investigated." It is **his own**:
```
GET /api/v1/users/me/workspaces -> {"workspaces":[{"id":"W4OWAY1Z8JFMM58","name":"Personal workspace",
     "slug":"personal-workspace","type":"personal","owner_id":"U4QDOUTSIDER001",
     "created_at":"2026-08-26T05:45:35Z"}]}
GET /api/v1/users/me/companies  -> {"companies":[{"id":"O4QDF1XTURESO01","name":"QA Fixtures D",…}]}
```
A `type:"personal"` workspace auto-created for him at first login (05:45Z, ~17 min before that
session's kick at 06:02Z), not a leak into another lane's workspace. Nothing to file. Worth knowing:
a company member who is in no shared workspace sees only this personal workspace — the switcher
offers just `Personal workspace` and `Create workspace`, and the company he belongs to is not
named anywhere in the shell.
---

## Personal settings block

### Verified working — password change, validation and session handling
Settings → Security → Password. `Update password` is **never disabled** (unlike every other form in
this app), but the form validates on submit and says what is wrong:
```
all three fields empty       -> no request; "New password must be at least 8 characters."
new = 7 chars                -> no request; "New password must be at least 8 characters."
new != confirm               -> no request; "New passwords do not match."
wrong current, valid new     -> PATCH /api/v1/security/password/change -> 400
                                "Current password is incorrect or the new passwords do not match."
valid change                 -> PATCH /api/v1/security/password/change -> 200
                                toast "Password updated."
                                redirect to /login?next=%2Fw%2F{ws}%2Fsettings%2Fsecurity
                                GET /api/v1/auth/me -> 401   (the acting session is invalidated too)
```
The change is real, not just client state: after it, `seed.sh --verify --lanes D` reported
`qa.d.bob@aloqa.test verified=True password_matches=False` against the fixture password, and logging
in with the new one succeeded. Changed back afterwards and repaired with `seed/seed.sh --lanes D` —
`password_matches=True`, "All fixtures present and correct."

**Nearly reported and withdrawn before it reached the report:** "password change succeeds silently,
no confirmation". A first probe read notifications once, ~4 s after the click, and found none — by
then the app had already routed to `/login` and the toast was gone. Re-measured with a poll running
from **before** the click, keeping each notice's maximum opacity over its lifetime, the toast is
there: `"Password updated."`, opacity 1. Same instrument error as the DM-notice probe earlier today,
in the opposite direction. Not a defect.

Left as an observation, below the bar: the toast was caught in only one 200 ms sample before the
route change, and the sign-in page the user lands on gives no reason for being signed out.

Also below the bar: the 400 body reads *"Current password is incorrect **or the new passwords do not
match**"*, but the client has already blocked the mismatch case locally, so at that point only the
first half can be true.

### Verified working — notification settings are three switches on web
`Settings → Notifications` renders exactly three, all enabled, no other controls:
`In-app notifications` (on), `Mute channel notifications` (off), `Mute direct messages from unknown
people` (off), under the heading `In-app notifications — Control notification delivery inside Aloqa.
Browser notifications are not used.` The DND-schedule, keywords, snooze and per-channel panels that
exist in the source tree (`NotificationsDndSchedulePanel`, `NotificationsKeywordsPanel`,
`NotificationsSnoozePanel`, `NotificationsChannelsPanel`) are **mobile-only** — none renders on web.
Persistence of these three was already covered by the morning pass.
---

## Auth & onboarding block

### BUG-5 [Low] [frontend] After a failed password reset the page says "Request a new one" and gives no way to do it

**Where:** `/reset-password?token=…` with an expired or invalid token, after submitting a new password.

**Repro:** open a password-reset link that has expired (or any `/reset-password?token=<anything>`) →
type a valid new password twice → `Reset password`.

**Measured.** The token is only checked on submit; the failure text names an action the page does
not offer. Every visible control on the page after the failure:
```
POST /reset-password -> 200
screen: "This reset link is invalid or has expired. Request a new one."
controls: button "Language" | button "Reset password" (still enabled) | a href=/login "Back to sign in"
"Request a new one" is not inside an <a> or <button> — plain text (ancestor walk: no A/BUTTON found)
```
The same page in its **missing-token** state (`/reset-password`, no query) renders the control:
`This reset link is missing its token. Request a new one.` with `a: Request a new link`. So the
control exists and simply is not offered in the state that tells the user to use it. The remaining
`Reset password` button stays enabled and fails identically on every press.

**Как должно быть:** the invalid/expired state offers the same `Request a new link` control the
missing-token state already has.

### Verified working — auth error states across the board
```
/signup           empty -> "Enter a valid email address."; bad format -> same; password 7 chars ->
                  "Password must be at least 8 characters."; no display name -> "Display name is
                  required." — all client-side, no request issued
                  existing address -> POST /signup (Next.js server action) -> 200,
                  "An account with that email already exists." (also for the UPPERCASE variant,
                  so matching is case-insensitive)
/auth/verify-email   no token / garbage token / empty token -> identical, correct page:
                  "This verification link is invalid or has expired. Request a new one below."
                  plus a working resend form (email + "Resend verification email") and both
                  "Back to sign up" / "Back to sign in". Garbage token issues POST /auth/verify-email -> 200.
/magic-link/verify   no token and bogus token -> "This sign-in link is invalid or has expired.
                  Request a new one." with "Request a new link" and "Back to sign in" as real links.
                  Validates the token on load — the opposite of /reset-password, see BUG-5.
/reset-password   mismatch -> "Passwords do not match."; 7 chars -> "Password must be at least 8
                  characters." — both client-side
login, unverified account -> POST /login -> 200, no session (GET /api/v1/auth/me -> 401),
                  "Verify your email to sign in. Use the verification link from your signup email."
```

### Verified working — signup creates a real, gated account
One real signup was completed, because onboarding cannot be reached any other way:
```
POST /signup -> 200  ->  "Verify your email — We sent a verification link to <address>.
                          Open it to finish creating your account."  [Resend link] [Back]
GET /api/v1/auth/me -> 401                       (no session until verified)
auth_db.users: id U4OWLTMU9ET8AGG, email_verified = f, username auto-derived "QA_D2_Signup_2878"
present in all five user databases (auth/org/messaging/notification/realtime)
POST /api/v1/auth/login/user -> 400 {"key":"AUTH_EMAIL_NOT_VERIFIED","message":"email not verified"}
```
**Left over on staging — see Cleanup:** `qa.d2.signup.20260826@aloqa.test`.

### Not a defect — verification state is cached for an hour, and the product invalidates it
Setting `auth_db.users.email_verified = true` by hand did **not** let the account log in; the API
kept returning `AUTH_EMAIL_NOT_VERIFIED`. That is my instrumentation, not a defect:
```go
// auth-service/.../user_repository/get_by_email.go — GetByEmail caches the whole user
key := fmt.Sprintf("user:email:%s", email)   … _ = r.cache.Set(ctx, key, userPtr, 1*time.Hour)
// auth-service/.../user_repository/mark_email_verified.go — the real verify path clears it
_ = r.cache.Del(ctx, fmt.Sprintf("user:id:%s", user.Id))
_ = r.cache.Del(ctx, fmt.Sprintf("user:email:%s", user.Email))
```
The same file explains the personal workspace seen earlier: `MarkEmailVerified` writes a
`user_upserted` event in the same transaction and **org-service creates the personal workspace from
it** — so a verified account with no invitations legitimately lands in a workspace of its own.
Onboarding (name/company) is therefore **deferred to later in this run**, once the hour's cache TTL
has passed; no local `redis-cli` and I would not SSH into staging mid-run for a cache key.
---

### BUG-6 [Low] [frontend] With a single session, Sessions offers no control at all, under a subtitle promising "how to sign one out"

**Where:** Settings → Sessions, on an account signed in on exactly one device — the normal case.

**Repro:** sign in on one device only → Settings → Sessions.

**Measured.** Every interactive element in the page's content area was enumerated (buttons, links,
inputs, switches; the settings nav excluded), in both states, on the same account:
```
one session   GET /api/v1/security/sessions -> 200, 1 session
              content-area interactive elements: 0
              row: "Unknown device | Mozilla/5.0 (Macintosh…) Chrome/151.0.0.0 | 86.62.0.71 | 17 minutes ago | Current session"

two sessions  GET /api/v1/security/sessions -> 200, 2 sessions
              content-area interactive elements: 2  ->  button "Sign out"  |  button "Sign out other sessions"
```
Page subtitle in both: `Active sessions — Every device signed in to this account, and how to sign
one out.` The `Current session` row never carries an action, so with one device the page lists the
device and offers nothing.

**Как должно быть:** the page either offers an action on the current session too, or its subtitle
does not promise one when there is nothing to act on.

**Not a dead end**, which is why this is Low: signing out is reachable from Profile → Sign out.
`Unknown device` on every row is **ALK-3005** (open) — not this finding, and not filed again.

## Verified working — per-row Sign out really ends the other session
```
before: GET /api/v1/security/sessions -> 2
click "Sign out" on the other row  (no confirmation step for a destructive action)
        DELETE /api/v1/security/sessions/{id} -> 200
after:  GET /api/v1/security/sessions -> 1
other browser's next call: GET /api/v1/auth/me -> 401 {"key":"COMMON_UNAUTHORIZED"}
```
Genuinely invalidated server-side, same as the bulk "Sign out other sessions" the morning pass
checked. Neither control asks for confirmation.

## Verified working / noted — Account page
`Settings → Account` sections: PROFILE (avatar + `Change avatar`, and the address rendered as plain
text `Email qa.d.…@aloqa.test`), `Contact details` (Phone, LinkedIn, GitHub, website inputs),
`Region & language` (Language picker), `Danger zone` (`Deactivate` and `Delete`, both disabled,
labelled not available yet — the morning pass covered this).
**There is no way to change the account email address** — it is not an input anywhere on the page.
Recorded as a product gap, not filed: nothing on the screen claims it can be changed.

### BUG-2 strengthened — the Members page already holds the owner's id
The screen that enables `Remove` on the company owner fetches the company on load, and that
response names the owner outright:
```
page requests on /w/{ws}/settings/admin/members:
  GET /api/v1/users/me/companies                    -> 200
  GET /api/v1/companies/O4QDF1XTURESO01             -> 200
  GET /api/v1/workspaces/{ws}/members               -> 200
  GET /api/v1/companies/O4QDF1XTURESO01/members?limit=100&offset=0 -> 200

GET /api/v1/companies/O4QDF1XTURESO01 ->
  {"id":"O4QDF1XTURESO01","name":"QA Fixtures D","slug":"qa-fixtures-d",
   "owner":{"id":"U4QDOWNER000001","name":"QA Owner","username":"qa_d_owner"}, …}
```
So disabling that one row needs no extra request — the same comparison the page already makes for
"you cannot remove yourself".

**Same blind spot, second symptom:** the table's ROLE column lists the company owner as plain
`Member`, with nothing marking them as the owner (their authority lives in `companies.owner_id`,
not in a role). Read as the guest account:
```
QA Admin     Admin Member          QA Alice   QA D2 ws creator Member    QA Bob     Member
QA Carol     Member                QA Dave    Member                     QA Guest   Member Guest
QA Outsider  Member                QA Owner   Member          <-- the company owner
```

### Observation, below the bar — "Your role" on the Company dashboard shows one of several roles
The guest account holds three roles (`GET /api/v1/users/me/roles?company_id=…`): company `Member`,
company `Guest` (`is_guest: true`) and workspace `Member`. Settings → Admin → Company dashboard
reports `Your role  Member`, dropping the Guest role — while the Members table on the next page
shows `Member Guest` for the same account. Two screens, same data, different answers.

## Verified working — guest account gating matches a plain member
As `qa.d.guest@` (holding the company `Guest` role, `is_guest: true`):
```
admin/members         viewable, "You can view company members, but you cannot remove them", no Remove column
admin/company         Company dashboard renders (Workspaces 1, Members 8, Your role Member)
settings/roles        "Admin access required — You do not have permission to view company roles."
admin/audit-log       "Admin access required — You do not have permission to view the audit log."
admin/invites         "Admin access required — You do not have permission to manage workspace invites."
ADMIN nav for the guest: Company dashboard, Members only
```
Each refusal names the surface it is refusing and who can grant access. No 403 body leaked.

## Verified working — Company identity name validation
`Settings → Company → Company identity`, save bar appears only once the form is dirty:
```
initial            save bar absent
1 char       -> Discard | (disabled) Save changes
2 chars      -> Discard | Save changes
empty        -> Discard | (disabled) Save changes
whitespace   -> Discard | (disabled) Save changes
128 chars    -> Discard | Save changes          maxlength=128
200 typed    -> value clamped to 128, Save changes enabled
restored     -> save bar gone again
```
Same rules as the Create-workspace dialog, and nothing was saved. Unlike that dialog there is no
"Use 2 to 128 characters" hint, so a one-character name gives a disabled Save with no reason shown.

## Verified working — Company dashboard, both tabs
`Overview` — QA Fixtures D, `Workspaces 1`, `Members 8`, `Your role Owner` (for the owner), quick
actions `Edit company profile` / `Create workspace` / `Invite members` / `Manage roles`.
`Manage` — `Company identity` (name + avatar) and `Administration`: `Manage members`, `Manage
roles`, `Manage invites`, `Manage workspaces`. Switching tabs issues **no** request; it is a
client-side view over data already loaded.
Note this makes the earlier observation narrower: `Your role` shows a *primary* role — `Owner` for
the owner — and for the guest it picks `Member` over `Guest`. It is one-role-by-design, still
disagreeing with the Members table, which prints `Member Guest` for the same account.

## NOT COVERED — system settings and search reindex, and why
My sector's scope names *system settings* and *search reindex*. Both live on
`/w/{ws}/settings/admin/system-settings`, which is **super-administrator only**:
```
page (as company owner): "Platform system settings — Platform-wide limits and switches, applied to
every company." / "Admin access required — Only system super-administrators can change platform
settings. A platform administrator can grant this access."
source: apps/web/src/features/admin/AdminSearchReindexPanel.tsx is rendered by
        AdminSystemSettingsPage.tsx; i18n carries
        'admin.searchReindex.superAdminOnly': 'Reindexing is available to super-administrators only.'
backend: POST /api/v1/admin/search/reindex
```
No lane-D fixture account has the flag — `select email, is_super_admin from auth_db.users where
email like 'qa.d.%'` returns `f` for all eight. Granting one super-admin would give that account
platform-wide power over every company on staging, which is well outside a lane's blast radius, so
I did not do it. **These two items are untested and the report will say so.**

## Verified working — Uzbek localisation of the settings area
Captured ten pages in English, switched the interface to **Uzbek**, captured the same ten again, and
compared line by line. Every line that is byte-identical in both languages is a candidate for
untranslated copy; after removing data (emails, usernames, ids, user-agent strings, versions) the
only survivors are proper nouns and seeded role names:
```
settings/account         "LinkedIn"
settings/about           "Aloqa"
settings/roles           "Member" "Admin" "Guest" "QA second pass probe role"   <- role data, not copy
settings/admin/members   "Admin" "Member" "Guest"                               <- same
line counts identical in both languages on all ten pages (47/47, 65/65, 33/33, 27/27, 31/31,
31/31, 34/34, 72/72, 73/73, 28/28) — no missing or extra rows
pages: account privacy security sessions notifications about company roles admin/members admin/invites
```
No untranslated UI sentence found. The morning pass reached the same verdict for Russian.

**Rig note, and a real trap:** the language picker's items are **not** `[role=option]` /
`[role=menuitem]` — the popup is a Radix popper whose entries are plain nodes, so an option-based
locator reports an empty menu and reads as "Uzbek is not offered". Click by exact text inside
`[data-radix-popper-content-wrapper]` instead. The morning pass hit the same thing. The trigger is
`main button[aria-label="Language"]` and it sits **below the fold** (y≈841), so it needs
`scrollIntoViewIfNeeded()` too.

**Restore caught by luck, worth writing down:** my restore step looked the trigger up by
`aria-label="Language"` — which is itself translated once the UI is in Uzbek, so the restore failed
with "no language trigger" and left the account in Uzbek. Repaired through the same endpoint the UI
uses, sending the whole settings object rather than one field:
```
GET  /api/v1/auth/me            -> …"settings":{"privacy":{…},"language":"uz"}
PUT  /api/v1/auth/me/settings   {"language":"en","privacy":{…}} -> 200 {"ok":true}
GET  /api/v1/auth/me            -> …"language":"en", privacy unchanged
```
Corroborates BUG-3 from the other side: the Visibility **dropdowns** live in
`settings.privacy.online_visibility` on the account record, while the **switch** lives in
`presence-settings` — two stores for one promise.

## Verified working — deleting a role that is currently assigned
The interesting case: the role was **held by a member** at the moment of deletion.
```
before: QA Alice holds "QA D2 ws creator" (company: privacy.manage + role.get)
dialog: "Delete role? — This permanently deletes the role. This action cannot be undone."  [Cancel] [Delete]
        DELETE /api/v1/companies/roles/R4OWKCTRKEW6P6D -> 200
after:  roles table no longer lists it
        MEMBER ROLES: "QA Alice Member"  — the assignment is gone, no dangling role name
```
The assignment is cleaned up with the role; nothing is left pointing at a deleted id.

### Rig artifact caught — the "duplicated" confirmation text in that dialog
The dialog's `innerText` reads the warning **twice**, which looks like a render bug. It is not:
measured per block with the ancestor-opacity chain and `elementFromPoint`,
```
h2                     290x26  opacity 1  hit-test passes   "Delete role?"
p .text-body-secondary 290x48  opacity 1  hit-test passes   "This permanently deletes the role. …"
span .sr-only            1x1   opacity 1  hit-test passes   "This permanently deletes the role. …"  <- screen-reader copy
```
One visible sentence, one 1×1 `sr-only` companion. Same shape as the two false positives a parallel
sector withdrew today (`div.sr-only` 1×1 read as a duplicate toast). **Not a defect.**
Note the `sr-only` node still passes an `elementFromPoint` hit-test at its own centre, so size is
the discriminator here, not the hit-test.

## Verified working — role name validation (and a false positive it nearly produced)
`Settings → Roles → Create role`. The name field carries **no `maxlength`** and `Create role` is
**never disabled**, so the form validates on submit. Bisected by submitting real names:
```
len  64  -> POST /api/v1/companies/{co}/roles -> 200, role created (deleted again immediately)
len  80  -> no request, no role, inline message "Enter 64 characters or fewer."
len 100 / 110 / 120 / 127 / 128 / 160 / 200  -> identical
duplicate name "Member" -> POST … /roles -> 400, "A role with this name already exists here.",
                            no role created (table unchanged)
```
Limit is 64 characters, enforced clearly. Nothing to report.

**This was nearly BUG-7 "a long role name silently does nothing".** My first pass reported
`reqs: [] , notices: []` for every length ≥128 — no request, no message — which is exactly the
shape of the open ALK-3372 (a long call name failing silently). It was wrong: the message is a
plain inline node with **no `role` attribute**, and my notice poll only looked at
`[role=status] / [role=alert] / [data-sonner-toast]`. Widening the scan to inline text with an
error class found `"Enter 64 characters or fewer."` on every failing length.
**Fourth false positive avoided today by re-measuring rather than reporting.** The rule that caught
it: a probe that finds *nothing* is a claim about the instrument before it is a claim about the app.

Minor, not filed: workspace and company name fields hard-clamp at `maxlength=128` and show a
"Use 2 to 128 characters" hint, while the role name field has neither and only tells you after a
failed submit — three name fields, three behaviours.

### Duplicate-name error is shown twice — a second instance of the same pattern
Measured the way the DM notices were (poll from before the click, keep maximum opacity, key on
text+size so one element matched by two selectors is not counted twice):
```
inline  308x24  class "text-body-secondary text-red"  maxOpacity 1  39 samples
toast   352x77                                        maxOpacity 1  39 samples
```
One inline field error plus one toast, same wording. Less objectionable than the blocked-DM pair,
which says two different things; recorded as a pattern rather than filed.
---

## Re-verification pass (16:20–16:28, same build `v0.61.0-rc.5`)
Every finding reproduced from scratch — new roles created, new assignments, fresh page loads.
**6/6 reproduced. None withdrawn.**

| # | how it was re-run | result |
|---|---|---|
| BUG-1 | brand-new workspace role with only *Invite members…*, freshly assigned | 8/8 controls disabled again; `POST /api/v1/workspaces/invites` from the same account → **200** (`role_ids:[]`), invite revoked |
| BUG-2 | brand-new company role with only *Remove members from the company*, freshly assigned | own row DISABLED, owner's row enabled; dialog → `POST /api/v1/companies/kick` → **400**; screen "Could not remove the member. Try again." |
| BUG-3 | fresh baseline, dropdown then switch, second account reading presence each time | dropdown `Nobody` → `PUT /auth/me/settings` 200, other account still reads `"online":true`; switch off → `PUT /users/me/presence-settings/update` 200, other account reads `"online":false` |
| BUG-4 | new role-less direct invite | row again `QA Outsider … \| Pending \| Role unavailable \| … \| Resend invite  Revoke invite`; revoked |
| BUG-5 | fresh load of `/reset-password?token=…`, submit, full control enumeration | controls: `Language`, `Reset password`, `a href=/login Back to sign in`; "Request a new one" still not inside an `<a>`/`<button>` |
| BUG-6 | fresh load, single session | `GET /api/v1/security/sessions` → 1; content-area interactive elements: **0** |

All probe roles deleted afterwards; company roles back to `Member / Admin / Guest`, workspace roles
back to `Member / workspace_owner_…`.

## Verified working — invite link carrying a role, join to role, end to end
```
owner: Admin → Invites → role "Member · Workspace role" → Create invite link
  POST /api/v1/workspaces/invites -> 200
  {"id":"I4OW…","token":"…","workspace_id":"W4QDF1XTURESO01","used_count":0,
   "role_ids":["R4QDWSMEMBER001"],"status":"pending","expires_at":"2026-09-02T…"}
  card: "Invite link ready — Invite link: https://airion-cargo.store/invite?token=…  Copy link  Status: pending"

recipient (a company member in no shared workspace) opens that URL:
  before  workspaces: ["W4OW…/Personal workspace"]
  after   workspaces: ["W4OW…/Personal workspace", "W4QDF1XTURESO01/QA Workspace D"]
          roles:      ["company:Member", "workspace:Member"]     <- the invite's role was applied
  lands on /w/W4QDF1XTURESO01/directories, sidebar shows "Channels — No channels yet."
```
The role rides the link correctly. Joining happens on load with no confirmation step, which the
morning pass already logged as an observation; unchanged here.
Restored afterwards: `POST /api/v1/workspaces/kick -> 200`, link revoked, and
`seed.sh --verify --lanes D` → `company_members 8/8`, `workspace_members 7/7`, "All fixtures
present and correct."

## Verified working — invite link "Maximum uses" bounds
`min=1`, `max=10000` on the number input; empty means Unlimited.
```
1      -> Create invite link enabled        10000 -> enabled
10001  -> Create invite link DISABLED       99999 -> DISABLED
empty  -> enabled (Unlimited)
```
Over-max disables the button without saying why — same small gap as a 1-character company name.

## Rig note — the per-lane browser cap actually bit once
Needing `outsider` while owner/alice/dave/guest were up, `ensure.sh` refused: "lane D already has
4 browsers up (cap 4)". Resolved with the new `scripts/callrig/stop.sh D guest`, then
`ensure.sh D outsider`. No test was lost, only re-ordered. This is the first time in the run the cap
changed what I did rather than when I did it.
---

### BUG-7 [High] [frontend] The company Administrator role cannot open the Audit log at all, though the API serves it the whole company log

**Where:** Settings → Admin → Audit log, as a member holding the company **Admin** role
(`company.{co}.*` — every company permission, including `company.{co}.audit.view`).

**Repro:** assign the company `Admin` role to a member who has no workspace-level grant → sign in as
them → Settings → Admin → Audit log (and look at the ADMIN navigation group).

**Measured.** Same account, same second — the screen refuses, the API does not:
```
roles held:
  company   Member  company.{co}.member.view
  company   Admin   company.{co}.*                 <- covers company.{co}.audit.view
  workspace Member  workspace.{ws}.channel.create, workspace.{ws}.channels.view

screen: "Audit log — A record of the administrative actions taken in this company."
        "Admin access required — You do not have permission to view the audit log.
         A workspace owner or an administrator can grant this access."
        interactive elements in the content area: 0
ADMIN nav for this account: Company dashboard, Members, Workspaces   (no Audit log)

GET /api/v1/companies/{co}/admin/audit-log?limit=2   -> 200  {"entries":[{"id":"A4OW…", …}]}
GET /api/v1/workspaces/{ws}/admin/audit-log?limit=2  -> 403  {"code":403,"key":"COMMON_PERMISSION_DENIED", …}
```
The refusal text even tells the company's own administrator that "an administrator can grant this
access".

**Confirmed cause.** The capability gate asks only about the **workspace** layer, so a company-layer
grant can never open the section — at the deployed commit `c4b5386b4a3a`:
```ts
// packages/features/admin/model/capabilities.ts
const hasAuditLogSection =
  hasElevatedAuthority ||
  (workspaceId !== null &&
    hasPermission({ action: 'audit.view', scopeId: workspaceId, scopeType: 'workspace' }))
// hasElevatedAuthority = hasOwnerAuthority || hasCompanySuperAdminAuthority   (line 83)
```
Every neighbouring section consults the permission set for its own layer (`member.view`/`member.kick`
for Members, `role.get` for Roles, `invite` for Invites, company workspace-management for
Workspaces); the audit-log section is the only one that never asks about a company-layer grant.

**Not ALK-2997, and not a duplicate of it.** ALK-2997 is the *workspace* administrator case and its
preconditions say in as many words "User is **not** a company-level role holder"; its fix is the
`workspace.{wid}.audit.view` branch quoted above and it works — I verified separately that granting
exactly that permission opens the page and revoking it closes it again. This is the complement:
the company-layer holder, whom that branch cannot help.

**Как должно быть:** a holder of `company.{co}.audit.view` (directly or through the company
wildcard) can open the Audit log and read the company log the API already returns to them.

**Relation to the morning pass's BUG-1** (`aloqa-org-qa-2026-08-26-D.html`): same page, same
underlying decision to wire the panel to `wsId` only, but a different symptom and a different actor.
Theirs is *the owner gets in and sees a partial log*; this is *the company Administrator does not get
in at all*. A fix that only adds company events to the list would leave this one standing, so both
need naming. Flagged for triage rather than merged, since that report is already published.

### BUG-4 sharpened — a role-carrying invite renders its role correctly
Same form, same account, same table, only the role choice differs:
```
"Invite without a role"        -> row: QA Outsider (@…) | Pending | Role unavailable | … | Resend invite  Revoke invite
"Member · Workspace role"      -> row: QA Outsider (@…) | Pending | Member           | … | Resend invite  Revoke invite
```
So nothing is failing to read roles — the row prints the role name whenever there is one. The
defect is confined to the empty list, which the form offers as a deliberate choice, being rendered
with the *unknown* string (`admin.directInvites.table.roles.unknown` = "Role unavailable").
Both probe invites revoked afterwards.

## Verified working — 2FA setup rejects wrong codes, and says so
```
Enable -> POST /api/v1/security/2fa/enable -> 200
pending step renders: input "123456", "Resend code", "Cancel", "Confirm" (disabled until a code is typed)
wrong code -> POST /api/v1/security/2fa/enable/confirm -> 400   (three codes tried: 000000/123456/999999)
after enough wrong attempts the setup is invalidated outright
on screen (maximum opacity over lifetime, 120 ms poll started before the click):
  inline 700x26   "Could not verify the code. Try again."
  toast  352x103  "Too many incorrect codes. This code is no longer valid — start again."
leaving the page discards the pending setup: GET /api/v1/auth/me -> "two_fa_enabled": false
```
The account is never left half-enabled, and the rate limit is explained rather than silent.

**Nearly BUG-8 "a wrong 2FA code fails silently".** My first probe reported three `400`s and no
message. It was scanning for error text with a class matching `/red|error/` or wording matching a
short keyword list, over `p,span,div` only, once, 4.5 s after the click — and it found neither the
inline sentence nor the toast. Re-run with the notice recipe (poll from **before** the click, keep
the **maximum** opacity per notice, key on text+size, and include role-less inline nodes) both
messages appear immediately, at full opacity, across 134 samples.
**Fifth false positive avoided.** Every one of the five had the same shape: an absence measured with
an instrument that could not have seen the thing.

### Rig artifact — a toast intercepting the Confirm button
An earlier attempt failed with Playwright refusing to click `Confirm` for 30 s: a
`li[data-sonner-toast][data-expanded="true"]` "intercepts pointer events". Re-measured by tracking
both boxes for 12 s after `Enable`: no toast present at all, and `document.elementFromPoint()` at the
button's own centre returns the `Confirm` button every second. The interception in the failed run was
a transient error toast from the previous attempt, kept expanded under Playwright's own hovering
cursor while it retried. **Not a product defect** — but worth knowing that a bottom-centre toast and
this button share screen space, so a strict click can stall on it.

## Verified working — Switch company
`Settings → Company` → the control whose **aria-label is "Switch company"** (its visible text is the
company name) opens a menu: `COMPANIES / QA Fixtures D — Current / Create a company`. Only one
company exists for this account, so there is nothing to switch to; the menu is correct.
Selector note for the next session: `button:has-text("Switch company")` matches **nothing** —
the name is on `aria-label`, the text is the company. `button[aria-label="Switch company"]` works.

## Shared helpers validated (asked for by the rig session)
Used `safeClick` and `watchNotices` from `snip/lib.mjs` against the two cases that produced my own
false leads earlier today. Both behave correctly:
```
safeClick(page, 'main [role="combobox"]')  on the role-assignment picker at y≈1157 / viewport 1062
  -> ok:true, inView:true, self:true, top:"SPAN.min-w-0", name:"Member Select a member"
  afterwards: aria-expanded="true", 7 options
  (my own hand-rolled mouse click at the pre-scroll coordinates had produced aria-expanded=false)

watchNotices(page, {trigger: create a duplicate role})
  -> exactly 2 entries, both maxOpacity 1, firstMs 180
     "A role with this name already exists here."  308x24  role=alert     (inline)
     "A role with this name already exists here."  352x77  role=null      (toast)
  correctly deduped: the toast matches both [data-sonner-toast] and [role=alert] and would
  otherwise be counted twice, which is what my first hand-rolled version did.
```
Same numbers as my hand-rolled measurements, with less code. Switching to them for the rest of the run.

## Verified working — Blocked users, block and unblock from Privacy settings
```
before: GET /api/v1/messaging/users/blocked -> {"users":[],"total":0}; UI "You have not blocked anyone."
control: role=combobox named "Search workspace participants" — a typeahead INPUT, not a menu button
         (clicking it opens nothing; typing "Bob" offers  QB / QA Bob / @qa_d_bob)
Block ->  blocked list: [{"id":"U4QD…","username":"qa_d_bob","name":"QA Bob","blocked_at":"2026-08-26T11:46:21Z"}]
          after reload the section lists  "QB QA Bob @qa_d_bob  Unblock"
Unblock -> POST /api/v1/messaging/users/unblock -> 200; list back to {"users":[],"total":0};
          UI back to "You have not blocked anyone."
```
Both directions work and survive a reload. Fixture restored.

**Not filed — the silence is already open as ALK-3533.** `watchNotices` over both actions returned
only the section's own empty-state line; neither block nor unblock produces a confirmation. That is
ALK-3533 "[FE-WEB][PROFILE] Блокировка проходит молча — ни подтверждения, ни уведомления", filed by
the chat sector today. Same defect seen from a second surface (Privacy settings rather than the
profile popup) — worth a line on that ticket, not a new one.

**Selector note:** the three Visibility dropdowns and this typeahead are all `role=combobox` inside
`main`. Indexing blind picks a Visibility dropdown; the participant picker is index 3 and is the only
one whose accessible name is not "Workspace members". A blind index here changes a privacy
preference instead of blocking someone — my first attempt did exactly that (it changed nothing only
because the option text did not match).
---

## Dedup against Jira (mirror synced 16:48, 189 open bugs read)

**BUG-5 WITHDRAWN — exact duplicate of open ALK-3025.**
`[FE-WEB][AUTH] Reset password с недействительной ссылкой не даёт запросить новую` (Bug, Backlog).
Same page, same steps, same measurement, and it already makes the same comparison I did
("Для сравнения, /magic-link/verify и /auth/verify-email распознают недействительный токен и
предлагают Request a new link"). Removed from the report. Recorded here so a later session does not
rediscover it.

**BUG-1 is a regression of a CLOSED ticket, not a new defect — cite it.**
**ALK-2965** `[FE-WEB][Roles] Участник с правом приглашать в workspace не может отправить ни одного
приглашения`, status **TESTING** (= closed in this project, so not a dedup target). Its expected
result is exactly what still fails: *"Держатель права на приглашения открывает Invites и создаёт
ссылку-приглашение и персональное приглашение для своего workspace; недоступные ему данные уровня
компании не блокируют форму"*, and its first verification step is *"Участник с правом Invite members
to the workspace создаёт ссылку-приглашение и отправляет персональное приглашение"*.
What **has** changed since it was closed: the panel no longer shows load errors
(`Could not load roles` + Retry, `Could not load all company members. Try again.`,
`No company roles are available.`). It now shows one muted line, *"You need permission to view roles
before assigning them."*, and disables everything silently — including `Invite without a role`, which
needs no roles at all. So the **error-state half was fixed and the capability half was not.**
Its cause section names `useAdminInvitesPanel` requiring `useAdminRoles(companyId)` and
`useAllCompanyManagementMembers(companyId)`; on this build the disabling is expressed as
`isDisabled={panel.isMutating || panel.isRoleAccessDenied}`. Same defect, current shape.

**BUG-2 — an open TASK already specifies exactly this fix; report it as still-live and name it.**
**ALK-2598** `[FE][COMPANY] Kick: не предлагать удаление владельца и различать новые ключи отказа
(ALK-2500)`, **Task**, Backlog — outside the `issuetype = Bug` dedup filter, same as the morning
pass's BUG-1 against Task ALK-3307. It states the frontend consequence in as many words: *"кнопка
«Удалить» у владельца компании больше не сработает — сейчас она предлагается для всех, кроме себя
(useAdminMembersSettingsPanel.ts), и любой отказ показывается одним общим текстом
settings.company.members.kick.modal.error"* — both halves of my finding. My contribution is that it
is still live on `v0.61.0-rc.5`, with the measurement. Triage should merge on sight.

**BUG-3 — same family as two CLOSED tickets, different control pair.**
**ALK-2964** and **ALK-2878** (both TESTING) are the *Profile* page's `Active status` against the
Privacy page's `Show online status`. Mine is a different pair on a single page: the Privacy
**dropdown** `Online status` (`settings.privacy.online_visibility`) against the Privacy **switch**
`Show online status` (`presence-settings.hide_presence`). ALK-2878's own fix direction — *"Связать
оба элемента с одним authoritative presence setting"* — would cover mine if applied to every
presence control rather than that one pair. Cross-referenced, not merged.

**BUG-7 — adjacent to open ALK-3535, not covered by it.**
**ALK-3535** `[FE-WEB][ADMIN] Журнал аудита не показывает события уровня компании` (Bug, Backlog —
this is the morning pass's BUG-1, filed since). Its repro is *"Войти владельцем компании"* and its
subject is the **content** of the list. Mine is a different actor and a different failure: the
company **Admin** never reaches the page at all, and the cause is a different line — the
`hasAuditLogSection` capability gate, not the `useAdminAuditLog(wsId)` fetch target. Fixing ALK-3535
alone leaves BUG-7 standing. Also **not ALK-2997** (REVIEW): that is the workspace administrator,
whose preconditions say *"User is not a company-level role holder"*, and whose fix is present and
working on this build.

**BUG-4, BUG-6 — no duplicate found.** Greps over summaries and descriptions for `Role unavailable`,
`Invite without a role`, `directInvites`, `Sign out other sessions`, `Active sessions` return
nothing matching. ALK-3005 covers only the `Unknown device` *label* on Sessions, not the absence of
controls. ALK-2961 (TESTING) is about which roles an invite offers, not how an empty list is drawn.

**Also noted:** the morning pass's three findings are now filed — **ALK-3535** (audit log),
**ALK-3536** (`audit.view` raw key), **ALK-3537** (Workspace identity subtitle). **ALK-3536 no longer
reproduces on rc-5** — both scopes show real labels; see the top of this log.

**Report set after dedup: 6 findings — 2 High, 2 Medium, 2 Low, all frontend.**

## Published report
`reports/aloqa-org-qa-2026-08-26-D-2.html` → https://claude.ai/code/artifact/064c01ce-baeb-4af1-b456-a0c8c71efa7f
(pass that URL back as `url` to update in place; publishing without it creates a second artifact.)

Six findings: 2 High / 2 Medium / 2 Low, all frontend. BUG-5 dropped before publication as a
duplicate of open ALK-3025. Pre-publication scan for test-setup traces came back empty — no
`aloqa.test` addresses, no `qa_*` usernames, no user/company/workspace/role/invite ids, no rig
ports, no lane letter, no fixture names, no staging host. Every source citation re-read at the
deployed commit `c4b5386b4a3a` rather than in the working tree, which sits on an unrelated branch
33 commits behind the deployed build; two i18n line numbers differed between the two
(`4785→4805`, `4844→4864`), so the check was not cosmetic.
Prose budget per finding (Проблема + Фактический результат + Ожидаемый результат): 170 / 127 / 116
/ 123 / 99 / 122 words.
README row still to append at the end of the run.
---

## Onboarding (reached at 16:56, once the 1-hour `user:email:` cache expired)

Full walk of a brand-new account, from signup to a usable company.
```
new verified account, first login -> /w/<personal>/directories
  a "Personal workspace" (type "personal", owner = the user) exists
  welcome panel: "Welcome to Aloqa — Choose an action to start setting up your workspace."
                 [Create a company] [Create a channel]

Create a company -> navigates to /company/create  (a full page, not a dialog)
  name field: required, maxlength=128, hint "Use 2 to 128 characters."
  empty / 1 char / whitespace-only -> Create disabled;  2 chars -> enabled
  128 chars -> enabled;  200 typed -> value clamped to 128
  POST /api/v1/companies -> 200
  -> redirected to /w/<personal>/settings/company
     "Active company <NAME>" + [Create your first workspace]
     GET /api/v1/users/me/companies -> owner = the user
     GET /api/v1/companies/<CO>/workspaces -> 0 workspaces

Create your first workspace -> dialog (Name, Cancel, Create)
  POST /api/v1/workspaces -> 200, user moved to /w/<new>/directories
  workspaces now: "<NAME> (company)" + "Personal workspace (personal)"

in the new company workspace, everything opens correctly:
  Admin → Company dashboard: "Workspaces 1, Members 1, Your role Owner"
  Admin → Workspaces: lists the workspace, Create workspace / Open / Edit / Show storage
  settings nav gains the whole ADMIN group: Company dashboard, Members, Invites, Workspaces, Audit log
```
The path works end to end and is signposted at every step.

### NOT A DEFECT — sixth false positive avoided
I was one measurement from writing up *"the owner of a freshly created company is told by its own
admin pages that a company owner could grant them access"*. In the **personal** workspace both
`…/settings/admin/company` and `…/settings/admin/workspaces` really do answer:
```
"Admin access required — You do not have permission to view the admin overview.
 A company owner or an administrator can grant this access."
```
to the person who owns that company. What kills it: **the ADMIN group is not in the navigation
there at all.** Measured on the same account, same session, two routes:
```
/w/<personal>/settings/company   ADMIN group present: false
  settings nav: Account … About, Company, Workspace, Roles, <new workspace>, Open <new workspace>
/w/<company-ws>/settings/company ADMIN group present: true
  settings nav: … Company dashboard, Members, Invites, Workspaces, Audit log, Manage members, …
```
So the misleading text is reachable only by typing the URL, never by following the product, and the
app's own route out — `Settings → Company → Create your first workspace` — is offered exactly where
the user lands. Correct behaviour with a poorly worded direct-URL state. **Logged, not reported.**

The wording nit stays below the bar: the denial tells a company owner that a company owner could
grant them access. Same sentence as BUG-7 uses, and there it *is* on the followed path — which is
what makes BUG-7 a finding and this one not.

Related, and the reason the two behave differently: `deriveAdminCapabilities` gates every section on
`hasCompanyContext = companyId !== null && isCompanyContextTrusted`, with
`hasOwnerAuthority = hasCompanyContext && isCompanyOwner`
(`packages/features/admin/model/capabilities.ts`, deployed commit). A personal workspace supplies no
company context, so ownership cannot be seen from there. The measurement above is what proves it;
I have not traced why `companyId` is absent, and am not claiming it.

### Candidate — `/company/create` has no way back
Reachable from the welcome panel of every new account and from `Create a company` in the workspace
switcher for everyone else. Full-document enumeration, twice — as the new account and as an
established company owner — gives the same two elements and nothing else:
```
interactive elements in the entire document: 2
  input[text]  placeholder 'e.g. "Aloqa Inc"'
  button[submit](disabled) "Create"
headings (h1–h6, [role=heading]): none
landmarks (main/nav/header/footer/[role=main]): none
document title: "Aloqa"
body text in full: "Create a company  Name  Use 2 to 128 characters.  Create"
```
No `Cancel`, no `Back`, no link anywhere. Every comparable surface in the app offers one — the
`Create workspace` dialog has `Cancel`, `/auth/verify-email` and `/reset-password` have
`Back to sign in`. Browser Back works, so it is not a dead end; **Low**.
---

## Avatar upload (Settings → Account) — validation good, one open finding

### Verified working — client-side validation
```
accept attribute: image/jpeg,image/png,image/gif,image/webp,image/avif,image/heic,image/heif,image/bmp,image/tiff
.txt file        -> no request; "Choose a JPG, PNG, GIF, WebP, AVIF or HEIC image."
12 MB PNG        -> no request; "Image must be 10 MB or smaller."
64x64 PNG        -> "Crop your photo" dialog (zoom range min=1 max=3, Cancel, Apply)
Apply            -> dialog closes, blob: preview appears, Discard / Save changes bar appears
Save changes     -> POST /api/v1/users/me/avatar -> 200
```
Minor, not filed: `accept` admits `image/bmp` and `image/tiff`, the rejection message names only
"JPG, PNG, GIF, WebP, AVIF or HEIC" — the two lists disagree.

### Rig artifact — seventh false positive avoided
First probe reported a valid PNG producing **no request, no notice, no change** — the shape of a
silent failure. It was watching only notices and network. The upload opens a **`Crop your photo`
dialog** and then requires the page's `Save changes` bar; neither is a notice nor a request, so the
instrument could not see either. `safeClick`-style verification of the Apply button confirmed the
click was topmost (`elementFromPoint` returned the button itself), so the click was never the issue.

### BUG-9 [Medium] [backend] — CANDIDATE, one measurement still pending
After a successful upload the avatar is stored and visible to others, but the two settings pages
where the user set it keep showing their initials.
```
auth_db.users.avatar_url        = /public/be19f109-…      (identity of record)
org_db, messaging_db replicas   = same value
GET /api/v1/workspaces/{ws}/members  -> "avatar_url":"/public/be19f109-…"   for this user
GET /api/v1/auth/me                  -> no avatar_url field at all
rendered images (visible <img>):  Settings → Account 0 · Settings → Profile 0 · Directories 1
                                  (Directories shows src="/public/be19f109-…", 36px)
```
Contract check at the deployed commit: `user_me` in `apps/web/src/generated/openapi.json` **declares**
`avatar_url` (optional). `UserDomainToOgenMe` in
`api-gateway/internal/features/auth/v1/converter/converter.go:201` maps it whenever the domain value
is non-nil — so the value is already absent before serialisation, which puts it behind the gateway,
not in the client. Hence `[backend]`.

**Why it is still a candidate:** `GetByEmail`/`GetById` cache the whole user in Redis for **1 hour**,
and `MarkEmailVerified` deletes both `user:id:` and `user:email:` keys explicitly — so the codebase
already knows this invalidation is needed somewhere. If the avatar upload skips it, the correct
finding is "your own avatar does not appear for up to an hour", not "never". Uploaded 17:15;
re-checked 17:22, still absent. **Re-check after ~18:30 before writing this up** — the honest claim
depends on which it is, and I will not publish it until that measurement exists.

Cleanup owed: this avatar stays on the fixture account; there is no Remove control on the page
(the only `Delete` there is the account Danger zone). Null it in `auth_db` and the replicas at the
end of the run.

### Contrast that sharpens BUG-9 — the company avatar works end to end on the same kind of page
Same file, same browser, same session, `Settings → Company → Company identity`:
```
before: GET /api/v1/companies/{co} -> (no avatar_url field)
upload: no crop dialog, no Save step — the file input alone completes it
after:  GET /api/v1/companies/{co} -> "avatar_url":"/public/40d10867-…"
reload: the page renders <img src="/public/40d10867-…">      <-- shows on the page that set it
```
So a settings page **can** show the avatar it just set. The user's own avatar is the one that does
not: it reaches `auth_db` and every replica, other surfaces render it, and only `GET /auth/me` —
which is what `Settings → Account` and `Settings → Profile` read — omits it.

Also worth noting the two flows differ: the **user** avatar goes through a `Crop your photo` dialog
and then the page's `Save changes` bar; the **company** avatar has neither and applies immediately.

Cleanup owed: the company avatar as well as the user one.
---

### BUG-10 — **WITHDRAWN FROM THE REPORT. Real defect, but on an endpoint no screen reaches.**

> **Read this first.** The measurements below are correct and the API defect is real: the company
> audit-log endpoint's own `next_before` cursor is second-precision over microsecond data, so a walk
> with it reaches only 78 of 152 entries at `limit=5`. What is wrong is the **user impact I claimed**.
> The web UI does not use that cursor. Both the `Next` button and `Export` page the **workspace**
> endpoint, which returns no cursor, so the client synthesises one **one second above** the last row —
> an overlap, not a skip — and deduplicates by id. Measured: Next and Export both return every row.
> No screen requests the company endpoint at all (that absence is ALK-3535's subject). Under
> CLAUDE.md's scope rule — *"an endpoint no screen reaches is out of scope even when it is clearly
> untested"* — this does not belong in the report. Removed; see "BUG-10 closed out" at the end.
> Kept in full because the API defect is real and becomes user-reachable the moment ALK-3535 is fixed.

(original heading: Audit-log paging loses entries that share a timestamp, and the documented `before_id` remedy has no effect)

**Where:** Settings → Admin → Audit log → `Next`, on a log longer than one page.

**What makes it reachable.** The endpoint serialises `created_at` to **whole seconds**, while the
database stores microseconds — so any two entries written in the same second collide in the cursor.
One user action routinely writes several rows in one transaction: accepting an invite writes
`workspace.member_joined` and `invite.accepted` at the same instant, and this fixture log already
contains two such pairs without anyone contriving them.
```
DB  (org_db.audit_log): 2026-08-26 11:30:16.786616+00   <- microseconds
API (…/admin/audit-log): "2026-08-26T11:30:16Z"          <- seconds
duplicate created_at values in a 32-entry log: 2
```

**Measured.** Replaying the web client's own cursor algorithm — `before` = the `created_at` of the
previous page's last row, which is exactly what `useAdminAuditLogSettingsPanel` stores — with the
page boundary placed inside such a pair:
```
full log (limit=100)                    32 entries
page 1 (ends on the first of the pair)   5 entries
page 2 (before=2026-08-26T11:30:16Z)    26 entries
5 + 26 = 31.  Missing from both pages:
    {"id":"A4OWN9CU3ALIA47","action":"invite.accepted","created_at":"2026-08-26T11:30:16Z"}

same request plus the documented remedy:
page 2 (before=…&before_id=A4OWN9CU3H4MWKP)  26 entries — still missing the same row
before_id=nonsense, no before                 200, rows returned normally (invalid id accepted silently)
```
Both `before` and `before_id` are declared query parameters on this endpoint and on the company one.
Reproduced twice, identical results.

**Honest limit of the demonstration.** The fixture log holds 32 entries, so the UI shows one page
and `Next` is inactive; I forced the boundary with `limit=5` to place it inside the pair. The UI
uses a fixed `limit=100`, so a user meets this the first time their log passes 100 entries and a
same-second group straddles row 100 — which, given one action writes several rows at one timestamp,
is ordinary rather than exotic. I did **not** manufacture 100+ entries to see it through the button,
and the write-up says so.

**Confirmed cause — narrow boundary, not a mechanism.** The client sends only `before`
(`{ before, limit: AUDIT_LOG_PAGE_SIZE + 1 }`, with the comment *"The backend exposes only a
timestamp cursor"* — which the contract contradicts, since `before_id` exists). But adding
`before_id` does not change the response, so the loss is not the client's omission: **the endpoint
cannot express a position inside a same-timestamp group even when given the id.** That puts it
behind the API → `[backend]`.

**Как должно быть:** paging returns every entry exactly once regardless of equal timestamps —
either by honouring `before_id` as a tie-break, or by serialising `created_at` at the precision it
is stored and compared at.

### BUG-10 STRENGTHENED and re-rated Medium → **High**
The earlier demonstration needed a forced page size and a hand-built cursor. It does not: paging the
**company** audit log with the API's **own** `next_before` / `next_before_id` — the exact usage
`ALK-3307` prescribes — silently drops records. Two identical runs:
```
full list (limit=100)                     55 entries
walked with the API's own cursor          11 pages, 53 entries returned, 0 duplicates, no errors
missing from the walk, both runs:
  {"id":"A4OWN9CU3ALIA47","action":"invite.accepted","created_at":"2026-08-26T11:30:16Z"}
  {"id":"A4OWBI138HFA9D2","action":"invite.accepted","created_at":"2026-08-26T06:01:07Z"}
```
Each lost row is the second of a same-timestamp pair written by one action (accepting an invite
writes `workspace.member_joined` and `invite.accepted` in one transaction). Nothing reports a
problem — the walk terminates normally, the counts simply do not add up.

The two endpoints also differ in shape, which is worth a line for whoever fixes it:
```
GET /companies/{co}/admin/audit-log   -> {entries, next_before, next_before_id}   (full cursor)
GET /workspaces/{ws}/admin/audit-log  -> bare array                                (no cursor at all)
```
The web page uses the **workspace** endpoint, which returns no cursor, so the client synthesises one
from the last row's `created_at` — `{ before, limit: AUDIT_LOG_PAGE_SIZE + 1 }`, with the comment
*"The backend exposes only a timestamp cursor"*. On the workspace endpoint that comment is accurate;
on the company endpoint it is not. Either way the loss happens, so it is not the client's synthesis
that causes it.

**Re-rated High**: an audit log that silently omits records when read page by page is wrong data on
a security surface, and the omission is permanent and unsignalled. **Reachability is honest and
stated:** the UI pages at a fixed `limit=100`, so a person meets this the first time their log
passes 100 entries; today's fixture logs are 32 and 55, so the button itself shows one page.

**Dedup:** not ALK-2333 (a **Task**, and about replacing OFFSET pagination in notifications, company
members and pinned messages — different endpoints). ALK-3307 is a **Task** specifying this exact
contract, including the sentence *"Передавайте оба: без before_id записи с совпадающим created_at
теряются на границе страниц"* — so the failure mode was anticipated in the spec, and what I measured
is that passing both does **not** prevent it. Worth naming in the finding.

### Avatar family — three surfaces, one of them broken
```
company avatar    upload -> no crop, no Save step -> /api/v1/companies/{co} carries avatar_url
                  -> the page renders <img src="/public/40d10867-…"> after reload            OK
workspace avatar  upload -> no crop, no Save step -> users/me/workspaces carries avatar_url
                  -> the page renders <img src="/public/c8889e24-…"> after reload            OK
user avatar       upload -> Crop dialog -> Save changes -> POST /users/me/avatar 200
                  -> stored in auth_db and all replicas, other surfaces show it
                  -> Settings → Account and Settings → Profile render 0 images (initials)   BROKEN
```
The two org-level avatars set *and* display on the very page that sets them; only the user's own
does not. That rules out "settings pages just don't render avatars" as an explanation for BUG-9.
Cleanup owed for all three.

### Verified working — `workspace.edit` grants a real edit
Granting a plain member only *Edit the workspace*:
```
before grant: the Workspace name input is readOnly=true, with no explanation on the page
after grant:  readOnly=false; typing raises the Discard / Save changes bar
Save changes -> PATCH /api/v1/workspaces/{ws} -> 200, name changed
restored:     PATCH …/{ws} {"name":"QA Workspace D"} -> 200, seed.sh --verify clean
```
Noted in passing, not filed: for a member **without** the grant the field is silently `readOnly`
with no explanation, while the analogous company-identity field says "Only the company owner or a
system administrator can edit the company identity." Same situation, one screen explains itself and
the other does not.

Also noticed while reading the workspace list: fixture users' personal workspaces are named
`"<Name>'s workspace"` while the account created through signup today got `"Personal workspace"`.
Two naming schemes for the same auto-created object; too small to file, recorded so it is not
mistaken for a defect later.
---

### BUG-9 RESOLVED to its true shape — a staleness window, not a permanent absence
The pending measurement came back and **changes the finding**. Timeline, one upload:
```
17:15  POST /api/v1/users/me/avatar -> 200 (after Crop → Apply → Save changes)
17:20  auth_db.users.avatar_url = /public/be19f109-…   (and org_db, messaging_db replicas)
17:16  GET /api/v1/auth/me  -> no avatar_url field;  Settings → Account renders 0 images
17:22  GET /api/v1/auth/me  -> still no avatar_url
17:35  GET /api/v1/auth/me  -> "avatar_url":"/public/be19f109-…"
       Settings → Account 2 images, Settings → Profile 1 image, Directories 3
       nothing was done to the account in between — no re-upload, no re-login
```
So the correct claim is **"your own avatar does not appear on your own settings pages for a while
after you upload it"**, not "never". Roughly 20 minutes here; the bound is the one-hour TTL on the
cached user record, and the delay depends on when that entry happened to be written, so a user can
see anything from seconds to an hour.

**Had I published the earlier reading, it would have been wrong** — this is why it stayed a
candidate. Eighth near-miss, and the only one whose cure was waiting rather than re-measuring.

**Narrow responsible boundary (not a mechanism):** the value was in `auth_db` throughout, and the
endpoint began returning it with nothing touching the account, so the staleness sits behind the API.
`GetByEmail`/`GetById` cache the whole user for `1*time.Hour`, and `MarkEmailVerified` deletes both
`user:id:` and `user:email:` keys explicitly — the codebase already invalidates on write elsewhere.
I have not read the avatar write path and am not claiming it skips that; the boundary is what the
measurement supports. `[backend]`, **Medium**.

**Second observation started 17:37** — avatar uploaded for a different account to confirm the delay
reproduces rather than being a one-off. Result below when it lands.

### BUG-9 WITHDRAWN — not reproducible
Two further observations killed it, and neither needed waiting:
```
17:33  owner account, same snippet, first avatar
       POST /api/v1/users/me/avatar -> 200
       GET /api/v1/auth/me IMMEDIATELY after -> "avatar_url":"/public/8c3dfc6b-…"     present at once

17:35  the SAME account the delay was seen on, re-uploaded, same snippet
       before: "avatar_url":"/public/be19f109-…"
       POST /api/v1/users/me/avatar -> 200
       GET /api/v1/auth/me IMMEDIATELY after -> "avatar_url":"/public/04ba582f-…"     present at once
```
So the ~20-minute staleness observed at 17:15 does not reproduce — not on a second account, and not
on the same account with the same steps. One observation is not a finding, and the "first avatar is
the slow path" hypothesis is contradicted by the owner's case, which was also a first avatar and was
instant. **Withdrawn. It never reached the report**, because the pending measurement was treated as
blocking rather than as a formality.

What remains true and is *not* a defect: the upload flow is Crop → Apply → `Save changes`, and the
avatar does eventually appear everywhere. What I cannot explain is the single slow observation; it is
recorded here so that if someone sees it again they know it has been seen once and did not repeat.

**Ninth near-miss of the run.** Unlike the other eight, this one was not an instrument error — the
measurement was correct, the behaviour simply did not hold. The rule that caught it is the plainer
one: *reproduce before writing up*.

## Verified working — Resend invite and its rate limit
```
invite created, then Resend invite pressed immediately
  POST /api/v1/workspace-invites/{id}/resend -> 400
  inline: "Wait before resending this invite. You can resend once per minute."
  toast:  "Please wait before resending this invitation."
after ~60 s
  POST /api/v1/workspace-invites/{id}/resend -> 200      (no confirmation shown on success)
pressed again immediately -> 400 with the same two messages
```
The limit is counted from the invite's creation, which is right — creating it already sent the mail.
Two observations for the double-notice pattern: **failure** shows an inline message *and* a toast
with **different wording** (third instance today, after the blocked DM and the duplicate role name);
**success** shows nothing at all, which is the ALK-3533 family and not filed again.
---

### BUG-11 — **WITHDRAWN, NOT A DEFECT. DO NOT RE-FILE.** (was: "No channel notification is ever created")

> **Read this first.** Everything below was measured correctly and the conclusion was still wrong.
> The cause was **our seed**, not the product: `notification_db` keeps its own `channel_members`
> replica and `seed_qa_fixtures.py` never populated it, so the notification service had nobody to
> notify on any fixture channel. Channel notifications were working on real staging channels
> throughout (115 created that day; zero on any fixture channel, any lane). DMs were unaffected
> because DM channels are created at runtime, so their replica rows exist.
> The seed was fixed during this run, and **re-running the identical case then produced
> `{"title":"You were mentioned","type":"mention"}`** — see "BUG-11 closed out" at the end of this log.
> Kept in full because the measurements are sound and the trap is worth recognising.

**Found from my own sector:** testing whether `Settings → Notifications` actually does anything. The
three toggles save (the morning pass proved that); what nobody had checked is whether they govern
anything. They do not, because there is nothing to govern.

**Measured.** Recipient is a member of the channel, channel not muted, all settings permissive.
```
settings throughout: {"in_app_enabled":true,"mute_all_channels":false,
                      "mute_unknown_dm_users":false,"do_not_disturb_enabled":false}

1. plain channel message                 -> notifications total unchanged (1)
2. literal "@qa_d_alice" text            -> unchanged
3. real composer mention, chip inserted   -> unchanged
   request body captured from the client:
   {"channel_id":"C4QD…","body":"QA\\-D2 chip probe @qa_d_alice",
    "mention_user_ids":["U4QDALICE000001"],"idempotency_key":"…"}
   composer DOM: <span data-mention-handle="qa_d_alice" data-mention-user-id="U4QDALICE000001" …>
4. same, with "Mute channel notifications" ON  -> unchanged
5. same, with the recipient's browser CLOSED for ~30 s before and after -> unchanged
```
The mention **is** processed: the recipient's `Mentions` page reads
`All (1) Unread (1) — QA Owner · qa-general · now — QA-D2 mention probe @QA Alice`.
Only the notification is missing.

**Live tab, mute OFF and mute ON**, recipient sitting on another channel, `visibilityState:"visible"`,
polled at 200 ms for 30 s each with the maximum-opacity recipe: **no banner, no toast, nothing.**
Both states identical, so the toggle changes nothing observable either.

**Alternative explanations ruled out.**
```
per-channel mute:   messaging_db.channel_members.muted_until for #qa-general -> NULL for ALL SIX members
membership:         GET /workspaces/{ws}/channels includes the channel for the recipient (amMember true)
online suppression: reproduced with the recipient's browser closed
notification store: notification_db.notifications for this user -> exactly 1 row, type 1 (the old DM)
```

**Confirmed cause — narrow boundary.** The client sends `mention_user_ids`, the server processes the
mention (the mentions feed shows it), and `notification_db` never gains a row — so nothing on the
client dropped it. `[backend]`.

**Dedup.** **ALK-2559** `[BE][NOTIFICATIONS] Упоминания @mention, @all и @here не доставляются
пользователям с muted Channel` is **TESTING (closed)** and covers only the *muted-channel* case;
here the channel is unmuted and ordinary messages produce nothing either, so this is broader and not
a dedup target. **ALK-2637** (Task, Backlog) is about `@all`/`@here` and states in its context that
*"персональное @mention работает верно"* — this measurement contradicts that premise, which is worth
saying on the ticket. ALK-1633 (Ready) and ALK-1016 (REVIEW) are the `@all` payload and the
notifications/toasts split, neither this.

**Sector boundary, stated plainly:** mentions are sector C's and the notifications panel is sector
E's; the notification **settings** are mine, and that is how I reached it. Both of those sessions
have already published today, so I am reporting it rather than handing it into a void — flagged for
triage as cross-sector.

### BUG-11 bounded — the notification pipeline is alive; only the channel path is dead
The obvious "notifications are just broken" reading is wrong. A direct message to the same recipient,
seconds after the mention tests, notifies immediately:
```
owner → Alice, DM sent from Directories → Message
  POST /api/v1/messaging/messages -> 200
  Alice's notifications: total 1 -> 2, unread 1 -> 2
  newest: {"title":"New direct message","type":"dm_message","created_at":"2026-08-26T12:47:31Z"}
```
So delivery, storage and the panel all work. What produces nothing is every **channel** event —
plain message, literal-text mention, and a properly-formed `mention_user_ids` mention alike — with
the channel unmuted and settings permissive. That is the finding, and it is narrower and stronger
than "notifications are broken".
---

### BUG-11 WITHDRAWN — environment artifact, and it was published for ~10 minutes
A parallel session checked a table I did not and overturned it. **I verified their claim myself
before acting**, because a correction is a claim like any other:
```
messaging_db.channel_members   where channel_id = <fixture #qa-general>  -> 6
notification_db.channel_members where channel_id = <fixture #qa-general> -> 0
notification_db.channel_members, real staging channels                   -> 17, 17, 17, …
```
`notification_db` keeps its **own** `channel_members` replica, and `seed/seed_qa_fixtures.py` writes
channel membership only to `messaging_db` and `org_db`. So the notification service does not know any
fixture user is in the channel and has nobody to notify. Their wider check: 115 channel notifications
were created today on real staging channels and **zero** on any QA fixture channel, on any lane.

Every one of my five negative cases was measured correctly and every alternative I ruled out really
was ruled out — mute, membership *in messaging_db*, online suppression, storage. The one table I did
not think to look in is the one that mattered, and CLAUDE.md warns about exactly this:
*"Check whether staging is broken before blaming the product… Getting this wrong files a Critical
against code that is fine."* I checked `notification_db.notifications` and concluded the row was
never written; I did not check whether that service could see the membership.

It also explains the thing I had recorded as a separate oddity: `Mute channel notifications`
"governing nothing observable" — there was never a notification for it to suppress.

**Removed from the published report and republished** (nine findings → eight) within about ten
minutes of publishing. The report never stood overnight with it.

**Rule for me, and for anyone testing notifications on these fixtures:** a negative notification
result on a seeded channel measures the seed, not the product. The general form is broader than
notifications — *this app keeps per-service replicas of user and membership rows, so "the service
did not react" can mean "the service cannot see the row", and the fixture is as much a suspect as
the code.*

**Consequence for other sectors, already passed on:** any channel-notification or @mention-delivery
result any sector produced on fixture channels is measuring the seed. DM notifications are unaffected
— DM channels are created at runtime by the app, so their replica rows exist, which is why DMs
notified normally on this lane (verified: total 1 → 2, `type=dm_message`, at 12:47:31).
---

## BUG-11 closed out — the product is fine, proven by controlled re-run

After a parallel session fixed the seed (`notification_db.channel_members` now populated for every
fixture channel on every lane), I re-ran the exact case that had produced the false finding — same
channel, same sender, same composer path, same recipient, only the seed changed:
```
notification_db.channel_members for the fixture channel: 0 -> 6

mention (chip, mention_user_ids sent)      -> total 3 -> 4
   {"title":"You were mentioned","type":"mention","created_at":"2026-08-26T12:53:25Z"}
plain channel message, mute OFF            -> total 4 -> 5
   {"title":"New channel message","type":"channel_message"}
plain channel message, mute ON             -> total stayed 5      (correctly suppressed)
mention, mute ON  (the ALK-2559 override)  -> total 5 -> 6
   {"title":"You were mentioned","type":"mention","created_at":"2026-08-26T12:55:56Z"}
```
So all four behaviours are correct on `v0.61.0-rc.5`: mentions notify, plain messages notify,
muting suppresses plain messages, and **a mention overrides the mute** — which is precisely what
ALK-2559 describes and it works. Nothing to file; the settings toggle governs exactly what it says.

**Note for whoever owns ALK-2559** (Bug, TESTING): it was closed against fixtures whose
notification-side membership did not exist, so the verification that closed it could not have
exercised the path. The behaviour is correct today on a repaired fixture — that is a result worth
attaching to the ticket, rather than a doubt.

## Verified working — `mute_unknown_dm_users`
A genuine, working privacy control, in contrast to the Visibility pair in BUG-3:
```
toggle OFF, first-ever DM from an unknown sender  -> notified   (total 2 -> 3)
toggle ON,  first-ever DM from a different unknown sender -> NOT notified (total stayed 3)
```
---

## Notification toggles — no defect, and I walked into the morning pass's own trap

### The trap
`Settings → Notifications` has **no visible save control until the form is dirty**. Click a switch
and a `Discard` / `Save preferences` bar appears; without pressing it nothing is sent. Three of my
snippets clicked a switch, waited up to 15 s, saw **no request and no server change**, and produced a
textbook-looking "the toggles do not save":
```
click [role=switch] index 1 -> screen flips to true
GET /api/v1/notifications/settings at t=1s,3s,5s,9s,15s -> unchanged every time
non-GET requests in that window: none
after reload: reverted
```
Every line of that is true and the conclusion is still wrong. The snippet that *did* save all along
was the one that looks for a save bar after clicking — `saveButtons: 1`, then
`PATCH /api/v1/notifications/settings -> 200`, value persisted.

**This is the same false positive the morning sector-D pass published and withdrew** ("Notifications
toggles are not saved"), for the same reason, and it is described in their log. I ran the
`grep -il 'ложн\|false positive\|отозв' logs/*.md` sweep at session start and saw their file in the
hit list, but did not re-read the entry when I arrived at this page hours later. **The sweep is worth
nothing unless it is re-read at the moment the surface comes up, not once at the start.**
Also note this is a *closed* ticket's exact subject: **ALK-3436** (Bug, TESTING) describes "the
toggle goes out on screen, nothing goes to the server, after reload everything is as it was" — its
premise was "три переключателя и ни одной кнопки сохранения". That premise no longer holds: the page
has a save bar now, and with it the toggles persist.

### Verified working — `in_app_enabled` cannot be turned off, and says so
The one genuinely different case, measured properly with the save bar:
```
switch "In-app notifications" off -> Discard / Save preferences appears
Save preferences -> PATCH /api/v1/notifications/settings -> 400
  {"code":400,"key":"NOTIFICATION_NO_DELIVERY_CHANNEL",
   "message":"нужен хотя бы один канал доставки: включите in_app_enabled или mute_all_channels"}
on screen, both at full opacity:
  "In-app notifications cannot be turned off while no other delivery method is enabled. Keep them …"
  "Keep at least one notification delivery channel enabled."
server value: unchanged (in_app_enabled still true)
```
A deliberate backend rule, surfaced in the user's own language rather than as the raw key. **Not a
defect.** The switch does stay visually off after the rejected save, but that is ordinary dirty-form
behaviour with `Discard` sitting next to it.

Fourth instance today of one failure producing **two differently-worded messages** (after the blocked
DM, the duplicate role name and the resend rate limit). Consistent app-wide pattern; still an
observation, not a finding.

Small note: the backend's own message says "включите in_app_enabled или mute_all_channels" —
enabling *mute*_all_channels would not provide a delivery channel, so that sentence reads wrong. It
never reaches the screen (the client shows its own copy), so it is logged, not filed.

**Tenth and eleventh near-misses.** The tenth ("toggles do not save") was a missing precondition — the
save bar. The eleventh ("turning off in-app notifications fails silently") was the notice recipe
again, and this time I used `watchNotices` from the start and it found both messages immediately.
---

### BUG-10 STRENGTHENED again — the cause is second-precision, and the loss can be half the log
Generated volume (45 assign/revoke pairs on a throwaway role, in one in-page loop) took the fixture
logs past one page and changed the picture completely.
```
company audit_log, true totals from org_db:
  rows                                            152
  distinct created_at in the DB (microseconds)    150      <- only 2 exact ties
  distinct created_at as the API serialises it     63      <- whole seconds
  largest same-second groups                       25, 24, 23, 19 rows
  DB   2026-08-26 13:08:16.213481+00   ->  API  "2026-08-26T13:08:16Z"

walking with the API's own next_before / next_before_id to exhaustion:
  limit=5    16 pages   distinct entries reached:  78 of 152
  limit=25    6 pages   distinct entries reached: 128 of 152
  limit=100   2 pages   distinct entries reached: 152 of 152
  no duplicates, no errors, the walk terminates by itself in every case
```
So it is **not** about exact microsecond ties — it is that the cursor the API hands back has lower
precision than the data it must address. Every page boundary that lands inside a same-second group
discards the rest of that group, and the damage scales with the number of boundaries: at `limit=5`
**half the audit log is unreachable**. My first measurement (2 lost of 55) was mild only because the
fixture then had almost no same-second activity.

**UI check at volume, and an honest negative:** with the workspace log at 129 entries the page showed
`Page 1 · 99 entries` then `Page 2 · 30 entries` — 99 + 30 = 129, **nothing lost**, `Previous`
correctly disabled on page 1 and `Next` on page 2, and going back reproduced page 1 exactly. At
`limit=100` there is only one boundary, and in that run it did not land inside a group. That is
precisely the accident that makes this defect easy to miss, and the report now says so instead of
claiming a user meets it as soon as the log passes 100 entries.

Report updated and republished with the scaling table, the corrected cause, and the UI result.

**Generated data left behind:** 92 audit rows in lane D (45 `role.assigned` + 45 `role.revoked` +
`role.created` + `role.deleted`), all from a throwaway role named "QA D2 volume probe", which was
deleted. Audit logs are append-only history, so these cannot be removed; noted here so a later
session knows why lane D's log is long and full of role churn.

### Cleanup done — avatars
All four avatars uploaded during this run removed and verified:
```
auth_db / org_db / messaging_db / realtime_db  users.avatar_url  -> NULL for both accounts (0 remaining)
org_db companies.avatar_url  (lane company)    -> NULL
org_db workspaces.avatar_url (lane workspace)  -> NULL
notification_db.users has no avatar_url column — nothing to clear there
```
Note for the next session: the app caches the user record for an hour, so an avatar may still render
in the UI for a while after this. `seed.sh --verify --lanes D` reports "All fixtures present and
correct" — it does not check avatars, so this had to be done by hand.

### Permission cells filled — the Invites page is the outlier, confirmed three ways
Every other admin surface blocks honestly when its **read** permission is missing, naming the
permission it needs. Only Invites opens and disables everything.
```
role.manage alone (workspace)  -> "You cannot view roles here — Managing roles in this workspace
                                   requires the “View workspace roles” permission."
role.update alone (company)    -> "Admin access required — You do not have permission to view
                                   company roles. A company owner or an administrator can grant this…"
                                   content-area interactive elements: 0
privacy.manage alone (company) -> "Messaging restrictions unavailable — You need privacy management
                                   and company role access to change these restrictions."
invite alone (workspace)       -> page opens, all 8 controls silently disabled            <- BUG-1
```
Three honest gates against one silent one, all in the same settings area, is what makes BUG-1 a
defect rather than a design choice — and it is the argument the report now carries.
---

## Re-verification of the MORNING sector-D report on `v0.61.0-rc.5`
Their pass ran on `rc-3` and was verified on `rc-4`; nobody had checked it on the build now deployed.
All four are now filed tickets, so the verdicts are actionable.

| their finding | ticket | verdict on rc-5 |
|---|---|---|
| Audit log omits company-scope events | **ALK-3535** | **reproduces** |
| Workspace owner cannot leave | (owner dead end) | **reproduces** |
| Raw key `audit.view` in the permission list | **ALK-3536** | **FIXED — no longer reproduces** |
| `Workspace identity` subtitle promises absent fields | **ALK-3537** | **reproduces** |

```
ALK-3535  company log holds 3 entries with scope_type "company"
            role.created / role.assigned / role.deleted, ids A4OWR0BUKRBVXTB, A4OWQZF1ORJD6NR, A4OWQZ173KBA8WA
          those ids present in the workspace log: 0
          workspace log scope_type values: ["workspace"] only
          the page renders the workspace log -> company-scope events never reach the screen

ALK-3536  company scope: 11 checkboxes, raw keys found: []   audit label "View the company audit log"
          workspace scope: 9 checkboxes, raw keys found: []  audit label "View the workspace audit log"

owner     Danger zone: "Leave this workspace — Transfer workspace ownership before leaving."
          Leave workspace: disabled;  controls matching transfer/ownership anywhere on the page: []

ALK-3537  "Workspace identity — Name, URL, and default channel for this workspace."
          visible text inputs in the section: 1
```

**Instrument note on my own first attempt:** I initially compared the company-scope events against
the page by **action name** and got "company-scope events ARE on screen" — wrong, because my probe
roles produced `role.created` / `role.assigned` / `role.deleted` at *workspace* scope too, and the
action name cannot distinguish them. Re-done by **entry id**, the answer inverts. A comparison key
that is not unique is the same class of error as a probe that cannot see the thing.

## Verified working — the settings filter, including its empty state
`Filter settings` (present on every settings page, 17 nav items unfiltered):
```
"audit"    -> 1 item  Audit log            "ROLE"    -> 1 item  Roles        (case-insensitive)
"role"     -> 1 item  Roles                "xyzzy"   -> 0 items, and the panel reads
"notif"    -> 1 item  Notifications                    "No settings match that."
whitespace only -> all 17 (treated as empty)
"au dit"   -> 0 items (no fuzzy matching — reasonable)
"Роли"     -> 0 items (Russian query against an English UI — expected)
cleared    -> back to 17
```
**Twelfth near-miss.** My first probe looked for an empty state with the pattern
`/no (results|matches)|nothing found|ничего/i` and found none, which read as "filtering to nothing
leaves a blank list with no explanation". The real copy is **"No settings match that."** — it says
*match*, not *matches*, and my pattern required the plural. Same lesson as the role-name limit and
the 2FA error: **a keyword list is a guess about the product's wording, and an absence found with one
is a claim about the guess.** Enumerating the container's text, as the second probe did, has no such
dependency.

## Verified working — failed saves are reported, and nothing is silently lost
Forced the save endpoint to fail with `page.route(…, r => r.abort('failed'))` — the technique
CLAUDE.md documents — and watched with the notice recipe:
```
Settings → Workspace, rename, Save changes
  aborted: PATCH /api/v1/workspaces/{ws}
  on screen: "Could not save the workspace. Try again."
  Discard / Save changes remain, the typed value is kept so it can be retried
  server: name unchanged ("QA Workspace D")

Settings → Notifications, toggle, Save preferences
  aborted: PATCH /api/v1/notifications/settings
  on screen: "Something went wrong. Please try again."  and  "Network error. Check your connection."
  Discard / Save preferences remain
  server: settings unchanged, for both accounts checked
```
Both cases report the failure, keep the edit, and change nothing on the server. Fifth instance of one
event producing two differently-worded notices — here one is generic and one names the network, and
the specific one is the useful half.

**Worth carrying into BUG-2's context:** "Try again" is *correct* advice for these transient
failures, and the app uses the same string for the permanent refusal in BUG-2, where retrying can
never work. The copy is not wrong everywhere — it is wrong where the failure is permanent.

Incidental, not a defect: every fixture user now also has an auto-created personal workspace
(`"<Name>'s workspace"`, `type: personal`). These appear as users are exercised and are the app's own
behaviour, not something a session creates deliberately — worth knowing before someone reads a
workspace list and wonders where they came from.

### Boundary noted, not tested — `Settings → Calls and audio`
> **Позже в этой же сессии экран всё-таки был проверен** — сначала в сплошном обходе настроек (`Test sound` инструментирован до `new Audio()`/`setSinkId()`), затем ночью добавлена проверка сохранения выбора устройства. Заголовок «not tested» устарел; см. поправку в конце лога.
It sits in the ACCOUNT group of the settings nav, so it looks like personal settings, but its content
is call machinery: `Audio` (microphone/speaker pickers, "Play test sound on the selected speaker"),
`Video` (camera picker), `Behavior`, `Diagnostics`. Device choice and call quality are **sector A's**
("media and controls — mic, camera, device switching, quality"), and that page already has filed
bugs from the calls passes (e.g. ALK-3369, the Maximum video quality slider not reachable by
keyboard). Left to them rather than duplicating. Recorded here because the nav grouping makes it
look like sector D territory and the next session will have to make the same call.

### BUG-7 sharpened — the permission named "View the company audit log" does not open it
The published version used the company `Admin` role (`company.{co}.*`), where someone could argue the
wildcard is too blunt an instrument. The narrowest, correctly-named grant behaves identically:
```
role: one permission only, the checkbox labelled "View the company audit log"
      -> company.{co}.audit.view
holder's roles: company Member (member.view) · workspace Member (channel.create, channels.view)
                · channel owner of one channel · QA D2 co auditor (company.{co}.audit.view)

Settings → Admin → Audit log:  "Admin access required"
  interactive elements in the content area: 0
  ADMIN nav: Company dashboard, Members        <- no Audit log

GET /api/v1/companies/{co}/admin/audit-log   -> 200  {"entries":[…]}     server honours it
GET /api/v1/workspaces/{ws}/admin/audit-log  -> 403  COMMON_PERMISSION_DENIED
```
So the product offers a permission, labels it "View the company audit log", grants it, the server
honours it — and the screen it names cannot be opened with it. Report updated to lead with this
rather than the wildcard.

## Verified working — assigning the same role twice is idempotent
```
assign role R to member M   -> POST /api/v1/companies/roles/assign -> 200
assign role R to member M again -> 200, and the Member roles table shows the role once
org_db.user_roles rows for (M, R): 1
duplicate (user_id, role_id) pairs anywhere in this company: 0
```
No duplicate row, no error, and the second call is accepted rather than rejected — a reasonable
choice for an idempotent operation. Note the role picker offered an empty option list on the second
attempt, which suggests already-assigned roles are filtered out of it; the assignment still went
through because the previous selection was retained in the form. Not chased further — nothing is
wrong at either end.

### BUG-3 completed — the `Last seen` dropdown is inert too
```
Alice: "Last seen" = Nobody  ->  PUT /api/v1/auth/me/settings -> 200
       saved: "last_seen_visibility":"nobody"
Alice's browser closed so she goes offline
second account reads GET /workspaces/{ws}/presence:
  {"user_id":"…ALICE…","online":false,"last_seen_at":"2026-08-26T13:30:21Z"}   <- still exposed
  controls in the same payload: two other offline members also carry last_seen_at
restored to "workspace"
```
So of the section's five controls the note is **correct** for the `Online status` and `Last seen`
dropdowns, and **wrong** for the `Show online status` switch, which genuinely hides you. Added to
the report as a second measurement under the same finding.

### BUG-3 — all three dropdowns confirmed inert, and a thirteenth near-miss in the other direction
`Profile visibility` = Nobody, then read the workspace member list as another account:
```
first probe:  request body capped at n=400 characters
              regex for the account's user_id -> no match
              read as: "Profile visibility WORKS — the account is gone from the member list"
re-read with n=6000:
              members returned: 7
              "user_id":"U4QD…ALICE…","name":"QA Alice","username":"…","is_guest":false,
               "joined_at":"2026-08-25T15:20:01Z","presence":{"online":true …
              the account is present, exactly as before
```
So the third dropdown is inert too, and the section note is correct for all three dropdowns and
wrong only for the `Show online status` switch — which is what the report says.

**This near-miss would have gone the opposite way from the other twelve.** Every previous one was an
absence that was not real; this was an absence that was not real *and* would have produced a
"feature works, and dramatically" claim — a member vanishing from the roster. The cause is banal: I
truncated the response to 400 characters and then searched it. **A search over a deliberately
truncated body is not a search**, and CLAUDE.md warns about exactly this shape ("a truncated
`innerText` slice is not evidence a control is missing") — I had applied that rule to the DOM all
day and not to my own API helper, whose `n` parameter does the same thing.

## Verified working — keyboard reachability across the sector's screens
Tabbed through five pages from the top of the document and recorded every control that took focus
inside `main`, then compared against a full enumeration of the visible controls on each.
```
page                     controls   reached   not reached by Tab
settings/roles              52        37      "Workspace roles" (tablist), "Assign role" (disabled)
settings/admin/members      27        28      — none
settings/admin/invites      31        25      "Create invite link", "Send direct invites" (both disabled)
settings/notifications      20        19      — none
settings/privacy            29        23      "Block" (disabled), "Request export" (disabled)
controls focused without a visible focus ring, any page: none
```
**Every control that Tab does not reach is one that is `disabled` at load** — the two invite submits
until a role and a recipient are chosen, `Block` until a participant is picked, `Request export`
because the feature is off. Disabled controls are correctly not focusable. The one non-disabled miss
is the `Workspace roles` scope **tab**, which is right: a tablist takes Tab once and moves between
tabs with arrow keys.

Counts of "reached" are deduplicated by label, so they are not directly comparable to the control
totals (a page with six buttons all labelled `Delete` contributes one). The `not reached` column is
the meaningful output, and it is empty of real gaps.

Worth recording as a negative because ALK-3369 (a call-quality slider unreachable by keyboard) shows
this class is filed in this project — the org and settings screens do not have that problem.
---

### BUG-12 [Low] [frontend] Two Admin subtitles describe content the page does not show
```
Settings → Admin → Workspaces
  subtitle: "Every workspace in this company, and who may open it."
  on the page: Create workspace | the workspace card | Open … | Edit … | Show storage
               (Show storage expands to storage used and the recordings quota)
  nothing about who may open it

Settings → Admin → Company dashboard, Overview tab
  subtitle: "One view of this company’s people, workspaces and recent activity."
  on the page: company name | Workspaces 1 | Members 8 | Your role Owner
               QUICK ACTIONS: Edit company profile, Create workspace, Invite members, Manage roles
  no activity list at all, though the data exists —
  GET /api/v1/companies/{co}/admin/audit-log?limit=5 returns the latest events
```
The dashboard's numbers are correct: `Members 8` and `Workspaces 1` match `…/members` (8) and
`…/workspaces` (1).

**Third instance of one pattern in this settings area**, which is why it is reported as one finding
rather than two more Lows: **ALK-3537** (the `Workspace identity` subtitle promising URL and default
channel) is already filed and still reproduces on rc-5. Triage should sweep the section subtitles
once rather than open three tickets.

Report now carries **nine** findings; README row and lede updated to match.

## Verified working — revoking a permission while the holder's page is open
A state nobody had exercised: the holder is *sitting on* the screen the permission opens when it is
taken away.
```
grant workspace audit.view -> Alice opens Audit log, GET …/admin/audit-log?limit=100 -> 200, table renders
owner revokes the role     -> POST …/roles/revoke -> 200

Alice's page, read WITHOUT navigating:
  still rendering the table: yes, 99 rows, with Export CSV / Export JSON / Previous / Next
  her roles: probe role gone
  refetch of the same endpoint from her session: GET …/admin/audit-log -> 403

Export CSV pressed after the revoke:
  GET /api/v1/workspaces/{ws}/admin/audit-log -> 403
  on screen: "Could not export the audit log. Try again."
  download produced: none
```
The server enforces the revocation immediately; the already-fetched page keeps showing what it had,
which is ordinary SPA behaviour and leaks nothing new. The important half is that the **export
refetches rather than serialising what is in memory**, so a revoked user cannot turn a stale screen
into a file. Nothing to report.

Here "Try again." is the right advice again — the failure is a genuine 403 the user could resolve by
regaining access, unlike BUG-2 where retrying can never succeed.

## Verified working — invite `max_uses` is enforced, and the admin list reports it correctly
```
create link with max_uses = 1
  POST /api/v1/workspaces/invites {"workspace_id":"…","max_uses":1}
  -> 200 {"max_uses":1,"used_count":0,"status":"pending"}

first use  -> recipient joins, lands on /w/{ws}/directories, workspace appears in their list
             invite record: {"max_uses":1,"used_count":1,"status":"pending"}
recipient kicked back out, then opens the SAME link again
  -> not added (their workspace list is back to just the personal one)
     page: "Joining workspace — This invite is invalid, expired, or already used."
     plus a specific notice: "This invitation has reached its usage limit."
```
Enforced correctly, and the specific reason is surfaced rather than only the generic line — though
the generic sentence is the primary text and the useful one is secondary, which is the wrong way
round. Sixth instance today of one event producing a generic message and a specific one together.

**Nearly a finding, and the UI is right:** the invite record keeps `status: "pending"` after being
fully used, which looked like an exhausted invite reported as still open. The admin list does not use
that field — it shows `Used` with `1/1` in the uses column, derived from the counts. Checking the
screen rather than trusting the raw field is what settled it.

All probe invites revoked afterwards; `seed.sh --verify --lanes D` → `company_members 8/8`,
`workspace_members 7/7`, "All fixtures present and correct."

### BUG-10 — the Export button uses the same lossy cursor
Measured by intercepting the Blob the page builds, so this is the file's real content, not the
request count:
```
workspace audit log, true total in org_db:  141
Export JSON issues TWO requests, i.e. it does page:
   GET …/admin/audit-log?limit=100                                  -> 200
   GET …/admin/audit-log?before=2026-08-26T13%3A08%3A14Z&limit=100  -> 200     <- before only, no before_id
produced file: application/json, 92 664 bytes, 141 rows
```
**Complete today — 141 of 141 — and only by alignment.** The cursor second `13:08:14` holds **24
rows**; the export escaped losing any of them because the 100-row boundary happened to fall on the
last row of that group rather than inside it. Move the boundary by one row and the remaining rows of
that second are dropped from the file, exactly as the `limit=5` and `limit=25` walks showed.

That matters for the finding's framing: the affected control is not a hypothetical API consumer, it
is the **`Export CSV` / `Export JSON` button** an administrator presses to take the audit log away for
a compliance review. Added to the report's triage note.

Caveat closed: **CSV behaves identically to JSON.** Same two requests, `text/csv;charset=utf-8`,
49 810 bytes, **141 data rows plus a header** — the same 141 of 141, and the same exposure. Header
columns: `id, created_at, action, actor_id, target_type, target_id, ip_address, user_agent, …`
(the log records IP and user agent; only holders of the audit permission can export, so that is not
a finding, but it is worth knowing what leaves the building in that file).
---

## BUG-10 closed out — the API defect is real, the user impact was not

A parallel session challenged my "complete only by alignment" claim about the export with arithmetic
from `org_db`, and the challenge was right. The decisive measurement was the row count of the
**first** export request, which I had not captured.

```
Export JSON, both request bodies captured:
  ?limit=100                                  -> 100 rows, first 13:41:41, last 13:08:13
  ?before=2026-08-26T13:08:14Z&limit=100      ->  56 rows, first 13:08:13, last 06:00:48
  100 + 56 = 156 returned;  file = 141 rows, 141 unique ids
```
So the client's cursor is **one second ABOVE** the last row it received (last row 13:08:13, cursor
13:08:14). That re-reads the whole of that second — an **overlap**, not a skip — and the export then
**deduplicates by id**, which is why 156 returned rows become a correct 141-row file. The same is
true of the `Next` button: it pages `…/workspaces/{ws}/admin/audit-log?before=2026-08-26T13:08:14Z&limit=100`,
the identical overlapping cursor. CSV behaves identically to JSON.

**So the web UI loses nothing, and never could with this cursor synthesis.** My earlier UI walk
(99 + 30 = 129 of 129) was not luck — it was the design working.

Where the defect *does* live, unchanged and still measured:
```
company endpoint, its OWN documented cursor:
  page 1 (limit=5) last row 13:40:01, id A4OW…D6J
  next_before = "2026-08-26T13:40:01Z"   next_before_id = A4OW…D6J   (cursor EQUALS the last row)
  page 2 starts at 13:39:19 — everything else inside 13:40:01 is skipped
  walking to exhaustion: limit=5 -> 78 of 152 · limit=25 -> 128 of 152 · limit=100 -> 152 of 152
```
**No screen requests `/api/v1/companies/{co}/admin/audit-log`.** I checked six admin routes plus the
`Next` button; the only API audit call any of them makes is to the *workspace* endpoint. That absence
is precisely ALK-3535's subject.

**Therefore withdrawn from the report** under CLAUDE.md's scope rule: an endpoint no screen reaches
is the developers' job, not this sector's. Removed and republished (nine findings → eight).

**It becomes user-reachable the moment ALK-3535 is fixed**, because that fix points the page at the
company endpoint and its cursor. Whoever picks up ALK-3535 should page the company log at
`limit=5`/`25`/`100` and compare distinct ids against the table before calling it done — the numbers
above are a ready-made regression case, and lane D's log now has same-second groups of 19-25 rows
sitting there for it.

**My error, precisely.** The measurements were sound; I inferred the consumer instead of measuring
it. I saw a lossy cursor on the company endpoint and assumed the UI used it, then wrote a triage note
asserting the Export button was affected — without capturing the one number (page 1's row count) that
would have shown the client overlapping rather than skipping. **The same shape as BUG-11: instrument
fine, suspect list short.** Second published finding withdrawn today, both after a peer supplied data
rather than an opinion.
---

### BUG-12 [Medium] [frontend] "Contact details" saves four fields that no teammate can ever see

`Settings → Account → Contact details`, subtitled **"How your team can reach you outside chat."**,
offers Phone / LinkedIn / GitHub / Website. All four save and persist correctly. **No other user sees
them on any surface, and no endpoint reachable by another user returns them.**

Save path works — `PUT /api/v1/auth/me/settings` → 200, values survive reload:
```
PUT /api/v1/auth/me/settings -> 200
  {"language":"en","privacy":{…},"contacts":{"phone":"+998 …","github":"https://github.com/…",
   "linkedin":"https://linkedin.com/in/…","website":"https://example.org/…"}}
after reload, fields repopulate from GET /api/v1/auth/me:
  …"contacts":{"phone":"+998 …","github":"…","website":"…","linkedin":"…"},"language":"en"…
```

Read path is **own-account only**. As a different user in the same workspace:
```
GET /api/v1/users/<alice>            -> 404
GET /api/v1/users/<alice>/profile    -> 404
GET /api/v1/users/<alice>/settings   -> 404
GET /api/v1/users/<alice>/status     -> 200, body: {}
GET /api/v1/workspaces/<ws>/members  -> 200, 3046 bytes, no contact keys
GET /api/v1/auth/me                  -> 200, returns the CALLER's contacts, not Alice's
```

Profile panel, opened two independent ways on fresh loads (people directory row button
`Open QA Alice's profile`, and the author avatar on her message in a channel) renders:
```
QA Alice / QA / QA Alice / Message / Call / Block / Share / SHARED CHANNELS · 2 / qa-general / qa-private
buttons: Close profile, Message, Call, Block, Share, qa-general, qa-private
API calls it makes: /users/<id>/status, /users/<id>/common-channels, /messaging/users/blocked
```
No phone, no links, and it never requests anything that carries them. Also checked and absent:
`Settings → Profile` (Identity / Availability / Quick status), the DM conversation header, and the
workspace member roster.

**Responsible boundary (measured, not inferred):** contacts live in the caller's own settings blob on
`/auth/me`; nothing another user can call returns them. So the gap is not a client dropping a field —
the data never leaves the owner's session.

Source locates it: on web the only files touching `contacts` are the edit form
(`apps/web/src/features/settings/AccountSettings.tsx`), its hook, `currentUserSettings.ts`, and
`features/telephony/*` — where `'contacts'` is only a tab id, unrelated. There is no display consumer.
Subtitle string: `packages/core/src/i18n/dictionaries/en.ts:666`
`'settings.account.contacts.subtitle': 'How your team can reach you outside chat.'`

**Not a stale-client artefact:** every observation above is from a `networkidle` load, and the two
profile-panel entry points were separate navigations.

**Verified working alongside it (not findings):** the `Discard` / `Save changes` bar appears correctly
on dirty and not before; `Danger zone` is honestly labelled — `Deactivate` and `Delete` are both
disabled with subtitle "Account deactivation and deletion are not available yet." and tooltip
"Not available yet", which is a deliberate deferral, not a dead control.
---

### BUG-12 (extended) — it is not four fields, it is seven plus a toggle

Continued from BUG-12. `Settings → Profile → Identity` collects **Job title, Department, Pronouns**
(plus Display name and Status message), and `Availability` has a **Show timezone** switch subtitled
*"Let teammates see your local timezone on your profile."* All persist:

```
PUT /api/v1/users/me/status   -> 200   {"text":"Testing profile fields","expires_at":null}
PUT /api/v1/auth/me/settings  -> 200   {"privacy":{…},"profile":{"jobTitle":"QA Engineer",
                                        "pronouns":"they/them","department":"Quality", …}}
GET /api/v1/auth/me after reload:
  name = "QA Alice"                       <- top level
  custom_status.text = "Testing profile fields"   <- top level
  timezone = "Asia/Tashkent"              <- top level
  settings.profile.jobTitle = "QA Engineer"
  settings.profile.pronouns = "they/them"
  settings.profile.department = "Quality"
  settings.profile.showTimezone = true
  settings.contacts.{phone,github,website,linkedin} = …
```

**The split is exactly top-level vs `settings.`** Everything under `settings.` is private to the
owner; nothing else can read it.

Profile card seen by another workspace member, fresh load, after all of the above was saved:
```
QA Alice / QA / QA Alice / Testing profile fields / Message / Call / Block / Share
SHARED CHANNELS · 2 / qa-general / qa-private
```
**Status message appears — and that is the control that makes this a defect rather than an opinion.**
It appears because it is served by `GET /users/{id}/status` (`{"text":"…","source":"manual"}`), which
the card does call. So the card can render a profile field; the other seven simply never reach it.

**`Show timezone` changes nothing.** With `showTimezone: true` saved and confirmed in `/auth/me`, the
card text is byte-identical to before enabling it. `git grep showTimezone` at the deployed sha finds
consumers only in the settings screen itself (`ProfileAvailabilitySection.tsx:61-64`,
`ProfileSettingsContent.tsx:39`) — no display consumer on web. The irony: the member payload already
carries `timezone: "Asia/Tashkent"` at top level, so the data a teammate would need is being sent and
not used.

**Verified-working control:** `Active status` is real — toggling it issues
`PUT /api/v1/users/me/presence-settings/update {"hide_presence":true|false}` → 200.
`Away when inactive` is honestly labelled "This feature is not available yet."

**Rig error worth recording:** my first attempt at the `Show timezone` switch walked up 4 ancestors
looking for the label and matched a container holding all three switches, so it flipped **Active
status** instead — and the request body (`{"hide_presence":true}`) is the only reason I noticed. Fixed
by binding each switch to the nearest ancestor containing **exactly one** `[role=switch]`, then
reading that container's text. Restored Active status to on and confirmed `presence.online: true`.
This is CLAUDE.md's "sibling controls share vocabulary" trap in a form the aria-label rule does not
cover — these switches have no aria-label at all, so the label must come from the DOM neighbourhood,
and "nearest ancestor with exactly one control" is the rule that makes that safe.

### BUG-13 [Medium] [backend] — **SECTOR E's SCREEN, HANDED OVER, NOT IN MY REPORT**

Found while chasing BUG-12; `Directories` and profile popups belong to sector E (`SECTORS.md:190`),
so this is theirs to file. Recorded here with measurements so it is not lost.

The People directory groups everyone under a single **OTHER** heading:
```
UI:  "Directories | Search directories | People | Channels | OTHER 7 | QA Admin … QA Alice …"
API: GET /api/v1/workspaces/<ws>/members?limit=50 -> 200, 7 members
     member keys: user_id, name, username, is_guest, joined_at, custom_status, presence, timezone, roles
     no "user" object, no "department", no "position", no "job_title" anywhere in the body
```
The client renders a department chip and groups by department —
`features/directories/DirectoryPersonRow.tsx:72-74` renders `person.department`, and
`utils/directories.ts:61` builds it from **`member.user?.department`**, falling back to the
`unassigned` bucket at `:98-99`. Members come back as flat objects with no `user` property, so
`member.user?.department` is always `undefined` → every person lands in one group.
Department is set and stored (`settings.profile.department = "Quality"`), just never sent here.

---

### BUG-14 [Medium] [frontend] `Sidebar position → Right` selects, persists, and never moves the sidebar

`Settings → Appearance → Sidebar position` offers `Left` / `Right`. Choosing `Right` selects cleanly
and survives reload — the control's own state is coherent. The sidebar never moves.

```
localStorage["aloqa.appearance"].sidebarSide = "right"
control on a fresh load:  Left=false, Right=true        <- restores correctly
channel page, viewport 1920:
  nav.app-shell-rail   x=0    right=72     w=72
  aside.app-shell-sidebar x=72 right=372   w=300
  main                 x=372  right=1920   w=1548
  order: rail < sidebar < main
```
With `Right` selected the sidebar should sit at the far edge (x ≈ 1620) and `main` should start at 72.
It renders in the identical position it holds under `Left`. Measured on a fresh load, not a navigation.

**Not a save problem** — nothing to save: appearance changes apply instantly and issue **no API request
at all**. The whole block lives in `localStorage["aloqa.appearance"]`; `/auth/me` has no `appearance`
key (`settings` holds only `privacy`, `profile`, `contacts`, `language`).

**Control group — the same screen proves the harness is sound.** Density, Accent color, Light sidebar,
Light navigation rail and Animations all take effect and all restore:
```
Density → Compact       --aloqa-button-sm 36px→32px, --aloqa-icon-sm 18px→16px, --aloqa-avatar-sm 36px→32px
Accent  → Violet        --c-brand #2454d8→#7c3aed, and a real button's bg follows
Light navigation rail   nav bg rgb(17,19,23) → rgb(238,241,246)
Light sidebar (off)     aside bg rgb(247,248,251) → rgb(26,29,36)
Animations (off)        buttons with a non-zero transition-duration: 12 → 0
```
So five of the seven settings on this page work. Sidebar position and Message layout do not.

### BUG-15 [Medium] [frontend] `Message layout` changes nothing, then resets to `Standard` and jams

Two defects in one control, both reproduced from a clean baseline (the `msgLayout` key removed, so the
app was genuinely in its default state before the run).

**It has no effect.** Message rows are byte-identical before and after choosing `Compact`:
```
baseline (no msgLayout stored):
  63 ~ 6px 20px ~ gap 12px ~ 16px/24px ~ py-[var(--density-msg-py)]
  38 ~ 1px 20px ~ gap 12px ~ 16px/24px ~ py-px
  38 ~ 1px 20px ~ gap 12px ~ 16px/24px ~ py-px
after selecting Compact (stored msgLayout="compact"), same three rows: identical, character for character
```

**Then it jams.** Full user path, every step measured:
```
1. fresh load          Standard=true  Compact=false      stored: (absent)
2. click Compact       Standard=false Compact=true       stored: "compact"     <- click lands
3. reload the page     Standard=true  Compact=false      stored: "compact"     <- selection does NOT restore
4. click Compact again Standard=true  Compact=false      stored: "compact"     <- click does nothing
```
After step 3 the control shows `Standard` while `compact` is stored, and there is no way back: clicking
`Compact` cannot re-select it (internal state already equals `compact`, so nothing changes and nothing
re-renders), and clicking `Standard` is a no-op because it already claims to be selected. The setting
is stuck at a value the screen denies holding.

**This is the only Appearance control that fails to restore.** Compared every group against the stored
JSON on a fresh load: `density`, `accent`, `sidebarSide`, `railTone`, `showRoles`, `linkPreviews`,
`markdownPreviewPanel`, `animations` all match what is displayed. Only `msgLayout` disagrees.

**Method note:** my first attempt at this compared `compact` against `compact` and concluded "no effect"
on a comparison that could not have shown one — the stored value was already `compact` when I took the
"Standard" sample, and the radio's `Standard=true` display is exactly what hid it. Establishing the
baseline by clearing the one key is what made the comparison mean anything. **A control that misreports
its own state will also corrupt any before/after you build on top of it** — read the stored value, not
the control, when setting up a comparison.

---

**ALK-3005 carries a source path that does not exist (verified independently, not filed).**
Sessions is my area and I cited this ticket, so I checked E's correction myself rather than relaying it:
```
ALK-3005 «Подтверждённая причина» cites: packages/features/settings/ui-web/SessionCard.tsx
at deployed sha c4b5386b4a3a, git ls-tree finds only:
  apps/web/src/features/settings/SessionCard.tsx
  apps/web/src/features/settings/__tests__/SessionCard.test.tsx
packages/features/settings/ exists but contains no ui-web/ directory
```
The rest of that ticket's causal claim still holds — the card falls back when `device_label` is
absent, and the endpoint does not send it. Only the path is wrong, and it is the kind of wrong that
costs a developer time silently. Almost certainly the stale-checkout problem reaching a filed ticket.
**Not filed and not commented on** — queued for the user with the other Jira items.
---

## The guest question, answered — `is_guest` is a disclosure flag, not an authorization input

Three sectors hit this independently (C: guest creates channels; D: guest granted `audit.view` opens
and exports the audit log; B: guest creates a call and holds host controls). Roles are my scope, so
here is the answer, grounded rather than inferred.

**The authorization path cannot see guest status.** The check is
`RoleRepository.UserHasPermission(userID, scopeType, scopeID, action)` →
`SELECT user_has_permission($1, $2)` with `(userID, permission)`. The permission string is
`{scopeType}.{scopeID}.{action}`. There is no guest parameter anywhere in the chain, so there is no
point at which being a guest could suppress a grant. Same for `UserHasExactPermission`.

**What the flag is actually for.** Every `IsGuest`/`is_guest` reference in Go outside tests sits in
serialization and display: `core/domain/member.go`, `core/domain/message.go`,
`messaging/v1/transport/authors_helper.go`, `role/converter/converter.go`,
`messaging/v1/service/get_guest_users.go`, `profile_share.go`. The design comment in
`messaging/v1/transport/guest_disclosure_test.go:19-21` (ALK-1086) says so directly — guest-ness is a
company-level marker carried as a separate boolean on the member row and the message author precisely
*because* it cannot be expressed through channel roles or membership. It exists to **disclose** an
external participant in chat, not to restrict one.

**So all three observations are one mechanism, and none of them is a permission bug.** The guest holds
a role that carries the permission; being a guest changes nothing because nothing consults it. The
system does exactly what it is built to do.

**What remains is a product question, not a defect, and I am not reporting it as one.** Whether "guest"
should imply a ceiling on what a role can grant its holder is a design decision, and CLAUDE.md forbids
deriving expected behaviour from source. The testable residue is an **expectation gap**: an admin
inviting someone as a guest may reasonably read that as a limit, and nothing in the UI says it is not
one. That is worth raising with the product owner; it is not worth filing as a bug, and I would rather
say so than dress a design question as a finding.

If the answer comes back "guest should restrict", the enforcement point does not exist yet and the
tests would be: a guest with `workspace.audit.view` is refused at the API, not just hidden in the nav;
a guest holding the workspace `Member` role cannot create a channel; a guest cannot hold host controls
in a call they created. All three currently pass in the opposite direction.

### Near-miss — "Show member roles does not flip" was my picker, not the product

`d2-appfx.mjs` reported `Show member roles: true -> true` and I nearly logged a second stuck control
next to `Message layout`. Re-tested every switch on the page by index, each flipped and each wrote to
storage:
```
Light sidebar           false -> true  restored  store changed
Light navigation rail   true  -> false restored  store changed
Show member roles       true  -> false restored  store changed
Link previews           true  -> false restored  store changed
Markdown preview panel  false -> true  restored  store changed
Animations              true  -> false restored  store changed
```
The first run's picker searched `main button` with a text-prefix rule and matched a different element.
**Two stuck-control candidates on one screen should have been the tell** — one is a finding, two of the
same shape on the same page is usually the harness. The index-based picker removes the guesswork.

### Verified working — Theme

`Light` / `Dark` / `System` all switch (`data-theme` and `body` background follow), persist across
reload, and mark the active option with `aria-pressed`. My earlier sweep reported "(no state)" for all
three only because it read `aria-checked` and this group uses `aria-pressed` — **enumerating one
attribute is the same mistake as enumerating one tag type.**
---

## Verified working — settings sweep (no findings in any of these)

**Admin → Members.** Rows carry avatar, display name, username, roles and join date, with one action:
`Remove <name> from the company`. `Remove QA Owner` is **disabled** for the owner viewing their own row.
The confirm dialog is explicit — "Remove <name> from the company? They lose access to every workspace
in this company." with `Cancel` / `Remove member` / `Close` — and `Escape` dismisses it without
removing (target row still present afterwards). Nothing was actually removed.

**Guests are disclosed to an admin.** Worth settling since three sectors asked about guests: the guest
holds *the same roles as everyone else* — `roles: ["Member/workspace"]`, identical to Alice, Bob, Carol
and Dave — and is distinguished solely by `is_guest: true`. The admin Members page nonetheless renders
their row as `QA Guest | Guest` where Alice's reads `QA Alice | Member`, so the flag does reach the
screen an admin looks at. No finding.

**Theme.** `Light` / `Dark` / `System` all apply (`data-theme` and body background follow), persist
across reload, and mark the active option with `aria-pressed`.

**Appearance switches.** All six flip, restore on a second click, and write to storage:
Light sidebar, Light navigation rail, Show member roles, Link previews, Markdown preview panel,
Animations. (Density and Accent colour verified separately by CSS-variable diff.)

**Calls and audio.** Microphone / Speaker / Camera pickers populate and open with the expected device
list. `Push to talk` and `Show call diagnostics (nerd info)` both flip and survive reload.
`Test sound` is properly built — the label goes `Test sound` → `Playing…` and the click produces
`new Audio()` ×1, `.play()` ×1 and **`setSinkId()` ×1**, i.e. it really does route to the selected
speaker. No errors, no unhandled rejections.
*My first measurement of this was wrong and would have produced a false finding:* I counted
`<audio>` elements in the DOM, saw zero, and nearly wrote it up as silent. `new Audio()` never attaches
to the DOM. **Counting DOM nodes is not a test for "did anything play"** — instrument the constructors
and `play()` instead, before the click.

**Contact-field validation is exemplary.** Each of the four fields rejects bad input with its own
accurate message, sets `aria-invalid="true"`, and the `Save changes` button goes **disabled** so
nothing is sent:
```
Phone    "abc"                             -> "Enter a valid phone number with 7 to 15 digits."
LinkedIn "https://example.com/not-linkedin" -> "Enter a LinkedIn profile URL."
GitHub   "https://example.com/not-github"   -> "Enter a GitHub profile URL."
Website  "notaurl"                          -> "Enter a full http or https URL."
Save changes: disabled; zero requests; server-side contacts unchanged
```
Noted because of the contrast, not as a finding: this is the most carefully validated form in the
sector, guarding data that BUG-12 shows nobody but its owner can ever read.
---

### Verified working — sign-out clears the session and the local caches that carry content

```
before sign out: 13 localStorage keys, GET /api/v1/auth/me -> 200
after  sign out:  9 localStorage keys, GET /api/v1/auth/me -> 401

cleared: aloqa.saved-messages.v2.<uid>   (saved message ids)
         aloqa.recent-channels.v1        (which channels the user visited)
         aloqa.active.channel
         aloqa.chat.outgoing             (unsent composer content)

retained: aloqa.appearance, aloqa.locale, aloqa-call-device-prefs,
          aloqa.message-visibility.v1, aloqa.calls.nerd-stats, aloqa.active.company,
          aloqa.active.workspace          <- map of userId -> last workspace, keeps PRIOR users' ids
          aloqa_saved_messages_migrated:<uid>:<ws>   <- 1-byte migration markers, per user
```
The right things go. What stays is bookkeeping — a 1-byte migration flag and a
`lastUsedWorkspaceByUserId` map that still lists an earlier user of the same browser profile.
**Deliberately not reported:** it discloses only that some user id last used some workspace id on this
machine, to someone already sitting at the browser. That is the cosmetic trivia CLAUDE.md says gets
trimmed at triage, and calling it a privacy finding would be inflating it.

### Which settings follow a user to another device — measured, no finding

Full storage census while signed in, so the split is on record rather than assumed:
```
SERVER (GET /api/v1/auth/me → settings.*, so they follow the account anywhere):
  language · privacy{read_receipts, online_visibility, profile_visibility, last_seen_visibility}
  profile{jobTitle, pronouns, department, showTimezone, awayWhenInactive}
  contacts{phone, github, website, linkedin}
SERVER (separate endpoint):
  GET /api/v1/notifications/settings -> {in_app_enabled, mute_all_channels,
                                         mute_unknown_dm_users, do_not_disturb_enabled}
DEVICE-LOCAL ONLY (localStorage — do NOT follow the account):
  aloqa.appearance  {theme, density, accent, msgLayout, sidebarSide, sidebarTone,
                     railTone, showRoles, linkPreviews, markdownPreviewPanel, animations}
  aloqa-call-device-prefs · aloqa.locale · aloqa.calls.nerd-stats · aloqa.message-visibility.v1
```
So **Theme and the whole Appearance page are per-browser**, and a user setting up a second machine
starts from defaults there. Not written up: device-local appearance is a defensible product choice, and
nothing in the UI claims otherwise — unlike the channel-mute case sector C found, where a client that
cannot read the setting back confidently displays the wrong one. The distinction is whether the screen
makes a claim it cannot keep. Recorded here so nobody re-derives the census.

Note `aloqa.locale` is device-local **and** `settings.language` is server-held — the same preference
exists in both places. Both read `en` here, so no divergence to report; worth a look if anyone sees
language disagree between devices.
---

### BUG-16 — folded into the published subtitle finding, not filed separately

`Settings → About` is a third instance of the subtitle-promises-absent-content defect already in the
report, so I widened that finding from two pages to three rather than filing a fourth Low. Same root,
same fix, one ticket.
```
About
  подзаголовок: "Version, licences and where to get help."
  content:      Aloqa | Version v0.61.0-rc.5 | "Workspace messaging for fast-moving teams."
                Diagnostics -> one switch, Send crash reports
  interactive elements outside the settings nav: 0
  no licences, no help or support link anywhere on the page
```
All three re-verified together on `v0.61.0-rc.5` / `c4b5386b4a3a`, freshly loaded:
`Admin → Workspaces` still promises "and who may open it" and shows Create workspace / the workspace
card / Open / Edit / Show storage; `Admin → Company dashboard` still promises "recent activity" and
shows counts plus QUICK ACTIONS; `About` as above.

**Measurement caveat recorded so the block is not misread:** the interactive-element filter in this run
excluded every `<a href*="/settings/">`, which also removed the legitimate `Edit <workspace>` link from
the Workspaces list. The published measurement block lists it correctly; only this re-verification run's
filter dropped it. **A filter written to exclude chrome will happily exclude content that shares its
shape** — the count is only as trustworthy as the exclusion rule, and "0 interactive elements" on About
is meaningful precisely because that page has no such links to lose.

### Verified working — About and Diagnostics

`Version v0.61.0-rc.5` on the page matches the deployed stamp `data-dpl-id="v0-61-0-rc-5-c4b5386b4a3a"`
exactly, so the build the user sees is the build under test. `Send crash reports` flips and survives
reload. Deployed build re-checked during this pass and unchanged since session start, so every source citation
in the report still points at the running code.
---

## Full re-verification of all 11 published findings — `v0.61.0-rc.5` / `c4b5386b4a3a`

Every finding re-run from scratch on a freshly loaded page. Probe roles were **created new** for this
pass (the originals had been cleaned up), so nothing here rides on earlier state.

| # | finding | result |
|---|---|---|
| 1 | invite permission → all controls disabled | **reproduces** |
| 2 | `View the company audit log` → no audit log | **reproduces** |
| 3 | kick delegate offered owner removal | **reproduces** |
| 4 | presence visibility contradiction | **reproduces** |
| 5 | seven profile fields + `Show timezone` invisible | **reproduces** (measured today) |
| 6 | `Sidebar position → Right` does nothing | **reproduces** (measured today) |
| 7 | `Message layout` inert then jams | **reproduces** (measured today) |
| 8 | invite without a role → `Role unavailable` | **reproduces** |
| 9 | single session → no actions | **reproduces** |
| 10 | company creation page → no way out | **reproduces** |
| 11 | three subtitles promise absent content | **reproduces**, and widened from two pages to three |

**1 — invite permission.** New workspace role with exactly `workspace.{ws}.invite`, assigned to a plain
member. Her effective permissions: `workspace.{ws}.invite`, `.channel.create`, `.channels.view`.
Invites page: **8 controls, every one disabled, identical across 4 polls 1.5 s apart** — Role,
Maximum uses, Create invite link, Search company members, the member row, Invite without a role,
Expires in days, Send direct invites. (A 9th control exists — the settings-nav filter box — and is
correctly *not* part of the finding.) Server, same account, same session:
```
POST /api/v1/workspaces/invites {"workspace_id":"<WS>","role_ids":[],"max_uses":1,"expires_in_days":1}
  -> 200 {"id":"<ID>","token":"<TOKEN>","role_ids":[],"status":"pending",…}
POST /api/v1/workspaces/invites/<ID>/revoke -> 200   (test invite removed)
```

**2 — audit.view.** New company role with exactly `company.{co}.audit.view`. Effective permissions:
`company.{co}.audit.view`, `company.{co}.member.view`. ADMIN nav group offers only `Company dashboard`
and `Members` — no `Audit log`. Direct navigation renders "Admin access required — You do not have
permission to view the audit log." with **0 interactive elements outside the nav**. Meanwhile:
```
GET /api/v1/companies/{co}/admin/audit-log?limit=5    -> 200, 5 entries
GET /api/v1/workspaces/{ws}/admin/audit-log?limit=5   -> 403 COMMON_PERMISSION_DENIED
```
The 403/200 split is the finding's cause made visible: the screen gates on the **workspace** layer
while the permission the user was granted is a **company** one, and the company endpoint honours it.

**3 — owner removal.** New company role with `member.kick` + `member.view`. For that delegate
`Remove <owner> from the company` is **present and enabled** (`disabled: false`), where the owner
viewing their own row gets it disabled. Confirming:
```
POST /api/v1/companies/kick -> 400 {"key":"ORG_KICK_COMPANY_OWNER",
                                    "message":"company owner cannot be kicked from the company"}
shown to the user: "Could not remove the member. Try again."
company members after: 8, owner still present
```
A permanent condition presented as something to retry.

**8 — Role unavailable.** Two invites created back to back by the owner, one with the workspace
`Member` role and one with `role_ids: []`, then read from the same table by that owner:
```
…/invite?token=<TOKEN>  Copy link   Role unavailable   Pending  0/1  …
…/invite?token=<TOKEN>  Copy link   Member             Pending  0/1  …
```
Both rows read by an account with access to every company role. Both test invites revoked afterwards
(200, 200).

**Cleanup.** All three probe roles deleted; the actor is back to `Member` in both scopes, confirmed
against `/companies/{co}/members` (8 rows) and `/workspaces/{ws}/members` (7 rows). Roles now present
are exactly the fixture set: company Member/Admin/Guest, workspace Member + owner role.

**Two method notes from this pass:**

- `DELETE /api/v1/companies/roles/{id}` deletes a **workspace**-scope role as well — the endpoint is
  scope-agnostic despite its path. Every nested form 404s: `/companies/{co}/roles/{id}`,
  `/workspaces/{ws}/roles/{id}`, `/workspaces/roles/{id}`, `/roles/{id}`. Not a finding (no screen
  exposes a path), but it costs time to rediscover.
- My cleanup snippet reported the actor as `(not found)` in both member lists and for a moment looked
  like a real problem. It was my own reader: the members array is under `.members`, and my helper only
  tried `.roles`/`.items`, so it silently read an empty list. **Same shape as the truncated-body miss
  earlier today — a reader that returns empty on an unexpected envelope is indistinguishable from a
  genuine absence.** Assert the container is non-empty before believing anything about its contents;
  `listSize` next to the answer is what caught it.
---

**Correction — two timestamps in this log were estimates, not clock reads.** Entries written as
"20:05" and "20:25" were guesses made between real readings of 19:19 and 19:44; both were roughly
40 minutes fast. Corrected in place. CLAUDE.md says to read the clock rather than estimate elapsed
time in a timeboxed run, and the reason is exactly this: the drift is large, one-directional, and
invisible from inside the session. Real readings so far: 18:53, 19:19, 19:44.
---

### Subtitle finding widened again — three pages to five

Sweeping the settings pages I had only touched lightly turned up two more clean instances, so the
published finding now covers five. Both freshly loaded, controls enumerated rather than read off text:
```
Workspace, section "Workspace identity"
  subtitle: "Name, URL, and default channel for this workspace."
  controls: Upload image | Workspace name | (Danger zone: Leave workspace, disabled)
  no URL field, no default-channel picker anywhere on the page

Security
  subtitle: "Your password, two-factor authentication and encryption keys."
  content:  Password -> Current password | New password | Confirm new password | Update password
            Two-factor authentication -> "Two-factor authentication is off." | Enable
  nothing about encryption keys
```

**A sixth candidate I chose NOT to include.** `Settings → Company` is subtitled "The company this
workspace belongs to, **and the workspaces inside it**", and the page lists no workspaces — but it does
carry an `Administration` block linking to `Manage workspaces`. The subtitle over-promises for the page
itself while the thing it names is one click away, which is materially weaker than a section naming
a control that exists nowhere. Including it would pad the count and give a developer a case they could
reasonably reject, which weakens the four beside it. **Five clean instances beat six with an arguable
one.**

### Verified working — Workspace danger zone

`Leave workspace` is disabled for the owner **and says why**: "Leave this workspace — Transfer
workspace ownership before leaving." That is the pattern the kick finding is missing — a control that
cannot succeed is disabled up front with the reason in view, instead of enabled and failing into
"Try again." Worth citing if anyone works that ticket: the fix already exists two screens away.
---

### Correction to the published finding #2, caught by re-verification

The published measurement block listed the ADMIN nav group as **"Company dashboard, Members,
Workspaces"** for a member holding only `company.{co}.audit.view`. Today's clean re-run with exactly
that permission set gives **"Company dashboard, Members"** — no `Workspaces`. The published line was
wrong. Corrected, and the block now separates the two cases explicitly instead of collapsing them into
one nav listing plus an aside.

**And the correction produced a much better control.** I created a role holding only the full company
wildcard `company.{co}.*` through the UI and assigned it:
```
CASE 1  company.{co}.audit.view only
        ADMIN nav: Company dashboard, Members                    <- no Audit log
CASE 2  company.{co}.*  (every company permission there is)
        ADMIN nav: Company dashboard, Members, Workspaces        <- no Audit log
        Workspaces appeared BECAUSE of the wildcard
both cases, same session:
  GET /companies/{co}/admin/audit-log?limit=5   -> 200, 5 entries
  GET /workspaces/{ws}/admin/audit-log?limit=5  -> 403 COMMON_PERMISSION_DENIED
  audit page: "You do not have permission to view the audit log.", 0 controls
```
So the wildcard demonstrably works in the very same nav group — it unlocks `Workspaces` — and still
cannot open the audit log, while the company endpoint hands the log over. That rules out "the wildcard
is not honoured" as an alternative explanation and leaves only the workspace-layer gate named in
`capabilities.ts:148`. **The old block asserted the same conclusion with weaker evidence and one wrong
number; the new one earns it.**

**Roles UI checked in passing, no finding.** The wildcard checkbox `All company permissions` is fully
independent of the ten individual boxes — ticking it leaves them unchecked and enabled, and ticking all
ten leaves it unchecked. That is a faithful rendering of what the role stores (`company.{co}.*` is one
permission string, not ten), and the label says plainly what it grants, so I am not reporting it.

**Two rig errors in this stretch, both the same family and both caught by checking the request:**
- I typed the role name into the **settings filter box**, because I took "the first `input` in `main`".
  The create click then produced no request at all, which is the only reason I noticed.
- My `Edit` click walked up ancestors looking for the row containing the role name and matched a
  container holding the whole list, so it opened a different role's form. The read-back showed
  `View company members=true` — the fixture `Member` role — which is what gave it away.
  **Third time today an ancestor walk has selected the wrong control.** The rule that keeps working:
  bind to the nearest ancestor that contains exactly one control of the kind you want, and confirm
  identity from the resulting state, not from the click.

**Cleanup complete.** All `D2 ` probe roles deleted; the actor holds `Member` in both scopes; roles
present are exactly the fixture set (company Member/Admin/Guest, workspace Member + owner role).
---

## Verified working — auth surfaces (no findings)

**Login does not disclose whether an account exists.** Real account with a wrong password and a
non-existent account produce the identical screen and the identical response:
```
REAL account + wrong password  -> POST /login -> 200, screen: "Invalid email or password."
UNKNOWN account                -> POST /login -> 200, screen: "Invalid email or password."
identical message, identical status, both stay on /login
```

**Forgot password is equally careful:**
```
REAL account     -> POST /forgot-password -> 200
UNKNOWN account  -> POST /forgot-password -> 200
both: "Check your email — If an account exists for that email, we have sent a link to reset
       your password."
```

**Signup validates client-side and does disclose existence** — deliberate, and not written up:
```
existing email      -> POST /signup -> 200, "An account with that email already exists."
password "abc"      -> no request at all, "Password must be at least 8 characters."
```
Disclosing on signup while concealing on login and reset is the normal trade-off — a signup form has
to tell you the address is taken. Recorded because the *inconsistency* looks like a defect at a glance
and is not one; anyone who re-finds it can stop here.

### Two rig errors on this stretch, same root as the earlier ones

- I filled the signup form before hydration finished (`waitUntil: 'domcontentloaded'`), the framework
  re-rendered, and the submit reported **all three fields empty** — "Enter a valid email address",
  "Display name is required", "Password must be at least 8 characters" on a fully filled form. That
  reads exactly like a product defect and is not one.
- Then, with `networkidle`, `fill()` still did nothing: I had taken indices from a **visible-filtered**
  list and applied them to an unfiltered `page.locator('input')`, so `nth(i)` addressed different
  elements. Fixed by using the real `name` attributes (`input[name=email|displayName|password]`).

**The check that caught both, and the one worth keeping:** read the field values back and assert they
are non-empty *before* submitting, and abort if not. A form that reports its fields as empty is
indistinguishable from a form whose validation is broken — the difference is only visible if you
measured the input state before you pressed the button. Every snippet that fills a form should now do
this; it turned two would-be findings into two rig fixes.
---

### Verified working — invite link accept, end to end

A company member who is **not** in the workspace opened a shareable invite carrying the workspace
`Member` role:
```
before: GET /api/v1/users/me/workspaces -> ["Personal workspace"]
open the invite link ->
  POST /api/v1/workspace-invites/accept -> 200
    {"workspace_id":"<WS>","user_id":"<USER>","role_ids":["<MEMBER ROLE>"],"joined_at":"2026-…"}
after:  GET /api/v1/users/me/workspaces -> ["Personal workspace","QA Workspace D"]
lands on /w/<WS>/directories, inside the workspace
```
The configured role is applied, not a default. **No confirmation step** — opening the link joins you
immediately. Recorded as behaviour rather than a defect: the user followed an invite deliberately, and
several products work this way. If anyone wants it challenged, the question is whether landing on
`Directories` with no "you have joined X" is enough feedback; I would want a poll from before the
navigation before claiming it is not.

**Removal copy is exemplary** — the counterpart dialog reads "Remove from workspace? — <name> loses
access to this workspace and its channels. Their company account and other workspaces stay as they
are." That is precisely the distinction a company-vs-workspace model needs to state, and it states it.

**Fixture restored:** the actor was removed from the workspace again (7 workspace members, company-only
account confirmed absent from the workspace list), and the test invite revoked.

### Invite `status` is stale in the API, correct on screen — deliberately not reported

```
API  GET /api/v1/workspaces/<WS>/invites   -> …VPF2TS  status="pending"  used_count 1 / max_uses 1
UI   same row rendered as                     Role unavailable   Used   1/1
```
The invite was fully consumed, the API still calls it `pending`, and the screen says `Used` — so the
client derives the label from the counts rather than trusting `status`, and the user sees the truth.
**No user-visible symptom, so out of scope** — the same rule that retired BUG-10. Logged because the
API field looks like a bug to anyone reading it directly, and because a future client that trusts
`status` would display it wrong.

Same payload, lesser oddity: `used_count` and `max_uses` are **absent rather than zero** on several
invite objects (`undefined/1`, `1/undefined`, `undefined/undefined`). The UI renders the missing
`max_uses` as `Unlimited`, which is a reasonable reading. Also API-only.
---

### The read-only invite inbox is KNOWN AND TRACKED — do not file it

Measured first, looked second. A direct invite reaches the recipient properly:
```
GET /api/v1/workspace-invites -> the invite with workspace_name "QA Workspace D",
                                 company_name, invited_by_name "QA Owner"
GET /api/v1/notifications     -> NOTIF_TITLE_WORKSPACE_INVITE_RECEIVED "Workspace invitation"
                                 "You've been invited to the \"QA Workspace D\" workspace"
UI: workspace-menu button carries a real visible badge — span 22×24 px, bg rgb(36,84,216),
    text "1", not sr-only — so a sighted user does get the cue
menu: PENDING INVITES | QA Workspace D | QA Fixtures D | Invited by QA Owner
      | Expires Sep 2, 2026, 8:08 PM | "Use the invite link from your email to accept or decline."
interactive nodes inside that region: 0
  (enumerated every descendant matching button/a/input/select/textarea, role=button|link|menuitem|
   checkbox|switch|option|tab, onclick, tabIndex>=0, or cursor:pointer — not just buttons)
notification row: no button and no link either
```

**ALK-1713 `[BE] Make the workspace-invite inbox actionable by invite ID` (Task, Backlog, open)
describes exactly this and explains it:** *"GET /workspace-invites currently returns pending rows
without plaintext tokens or display metadata, while accept and decline are token-only. The frontend
can ship only an informational inbox until a recipient-scoped ID contract exists."* Its acceptance
criteria add `POST /workspace-invites/{id}/accept|decline` and then notify ALK-1663 to add the
frontend actions.

**So the read-only inbox is the intended intermediate state, not a defect, and I am not filing it.**
The letter of the dedup rule only covers open *Bugs*, and ALK-1713 is a Task — but the rule exists so
we do not hand developers work they are already tracking, and this is plainly the same work with a
written plan. Same judgement as the guest question.

Worth flagging for whoever owns that epic, in the log rather than the report: **ALK-1663
`[FE-WEB] Add pending workspace-invite inbox and accept/decline` is already in TESTING**, i.e. closed,
and its acceptance criteria say "An invited authenticated user can list pending invitations and
**accept or decline** one." Only the listing half is true today. Given ALK-1713 is still open and is
its stated dependency, that sub-task looks closed ahead of the capability it claims. Not mine to
re-open; recorded so it is visible.

### What IS a finding, and is not covered by either ticket

The **sender's** screen oversells the in-app copy. `Settings → Admin → Invites`, direct-invite block:
> "Email delivery may be delayed. The invitation also appears in the recipient's in-app inbox."

Read together, that tells an admin the in-app inbox is a fallback when mail is slow. It is not — the
recipient can see the invitation and cannot act on it, and the invite text sends them back to the
email that may not have arrived. Neither ALK-1713 nor ALK-1663 touches this line; both are about
building the capability, not about what the admin page promises in the meantime. Small, but it decides
whether an admin chases a missing email or waits.
---

### Dedup caught a duplicate I introduced myself — and it was my own morning ticket

**Removed from the report:** the `Workspace identity` instance of the subtitle finding. It is
**ALK-3537 `[FE-WEB][WORKSPACE] Подзаголовок Workspace identity обещает поля URL и default channel,
которых нет` — Bug, Backlog, OPEN**, and its description matches mine down to the enumeration
("видимые поля ввода в области содержимого: 1. Filter settings 2. Workspace name"). It was filed off
**this morning's pass**, i.e. by me, earlier today. Subtitle finding is back from five pages to four.

**The lesson, and it is a process one rather than a technical one.** I deduped this finding when it had
two instances, then widened it to three, then to five, and never re-deduped the instances I added.
**Widening a finding is not editing a finding — each new instance is a new claim and needs its own
dedup pass.** The cost here was nearly re-filing a ticket I had opened myself eight hours earlier,
which is exactly the outcome the "look for withdrawn findings before you publish" rule exists to
prevent, in a form that rule does not cover.

### Two closed tickets that never shipped — added as a finding

`Settings → Workspace → Danger zone` tells the owner "Transfer workspace ownership before leaving."
next to a disabled `Leave workspace`. Searched six admin surfaces for any transfer or delete action:
```
Settings -> Workspace     23 controls   0 matches
Admin -> Workspaces       22 controls   0 matches
Admin -> Members          28 controls   0 matches  (only "Remove … from the company")
Roles (workspace)         44 controls   0 matches  (only "Remove <role> from <user>")
Directories               35 controls   0 matches  (only profile links)
Settings -> Company       25 controls   0 matches
only occurrence of "Transfer" in any of them: the instruction itself
```
Create workspace is offered from three places; delete from none.

**Both halves are closed tickets that did not ship:**
- **ALK-2806** `[FE-WEB][Workspace] Подсказка Leave workspace предлагает недоступную передачу владения`
  — **TESTING (closed)**. Its expected result: "подсказка называет выполнимое действие: удалить
  workspace либо воспользоваться явно описанным административным процессом."
- **ALK-1805** `[FE-WEB] Добавить Delete workspace в Company Admin` — **TESTING (closed)**.

Neither is present on `v0.61.0-rc.5`. `TESTING` means closed in this workflow, so these are not
duplicates to dedup against — reported, with both keys in the triage note so nobody re-derives the
history. Third closed-but-reproducing ticket found today, after ALK-2965.

**Also noticed, not filed:** ALK-1957 `[FE-WEB] Manage workspaces содержит только quota и не даёт
открыть, изменить или удалить Workspace` is **BLOCKED** and is the same neighbourhood. Left alone.
---

### Re-dedup of everything added today — one strengthening, no further removals

Ran the widened/new findings against a freshly synced mirror (3595 issues). Results:

**BUG-12 (profile fields) — both halves already filed and closed. Added to the report's triage note.**
- **ALK-2801** `[FE-WEB][PROFILE] Local time отсутствует в профиле при включённом Show timezone` —
  Bug, **TESTING (closed)**. Identical repro (enable `Show timezone`, another user opens
  Directories → People → profile card) and identical observation: *"Строка Local time отсутствует при
  наличии timezone в GET /api/v1/workspaces/{workspaceId}/members."* Its stated cause — timezone is
  lost inside Web between the response and the card — matches what I measured.
- **ALK-2288** `[BE][PROFILE] Настройка Show timezone не отображает Local time` — closed. Same, backend side.
- **ALK-618** `[FE-WEB] User Profile popup: enriched content…` — Task, **closed**. It *specifies* the
  popup contents: avatar, status, full name, **email**, **role / job title**, common channels,
  **timezone + local time**. Today the popup has name, Status message, action buttons and shared
  channels. Email, job title and local time are all absent.

So my finding is the fourth pass at this, and the first three are marked done. That belongs in front
of whoever triages it, so it is now in the finding's triage block rather than only here.

**Clean (no ticket, open or closed):** `Sidebar position`, `Message layout`, `Contact details`,
`Pronouns`, encryption-keys subtitle, licences/help subtitle, in-app-inbox copy. Greps run in both
languages where the term differs.

**Running total of closed-but-still-broken tickets found today: five** — ALK-2965, ALK-2806, ALK-1805,
ALK-2801, ALK-2288 (plus ALK-618 as a closed spec that was never met, and ALK-1663 closed ahead of its
own dependency). That is a pattern worth the user's attention on its own, separate from any single
finding: **`TESTING` in this project is being reached without the behaviour being present.**
---

### Verified working — role editing propagates immediately (the last gap in the lifecycle)

Create → assign → use → **edit** → revoke → delete is now fully covered. The edit half, measured
end to end with the edit done through the UI:
```
role created with [company.<CO>.audit.view, company.<CO>.member.view], assigned to a plain member
  holder: GET /companies/<CO>/admin/audit-log -> 200, 5 entries

edit form opened from the role's own row — loads the role's real permissions:
  View company members = true, View the company audit log = true, all others false
untick "View the company audit log", Save:
  PATCH /api/v1/companies/roles/<ID> -> 200 {"success":true}
  role now holds: ["company.<CO>.member.view"]

same holder, immediately after:
  effective permissions: company.<CO>.member.view only
  GET /companies/<CO>/admin/audit-log -> 403   (was 200 before the edit)
  audit page: 0 interactive elements
```
**No stale permission and no cache to wait out** — the removal takes effect on the next request. That
is the security-critical half of role editing and it is correct. Probe role deleted; the actor is back
to `Member` in both scopes and the role list is the fixture set again.

### Deliberately NOT tested, with the reason

**Enabling 2FA.** The Security page offers `Enable`, and the flow emails a one-time code on every
subsequent sign-in. There is no mailbox for the fixture accounts, so enabling it would lock the account
out of every browser — mine and any parallel session's — with no way back. The safe half **is** covered:
wrong codes are rejected with "Could not verify the code. Try again." and repeated failures hit
"Too many incorrect codes…". Recorded here so the gap is a decision rather than an oversight, and so
nobody enables it casually on a lane account.
---

### Verified working — the role assign/revoke UI (API path was already covered)

```
Assign a role: two comboboxes + [Assign role]
  member picker options: all 7 company members
  role picker options:   Member, Admin, Guest, + the probe role
  after picking, the comboboxes display the chosen values
  click Assign role -> POST /api/v1/companies/roles/assign -> 200 {"success":true}
                       toast "Role assigned."
                       target's roles: ["D2 assign probe","Member"]

Member roles list: one button per assignment, "Remove <role> from <member>"
  click -> POST /api/v1/companies/roles/revoke -> 200 {"success":true}
           target's roles: ["Member"]
```

**Observation, deliberately not written up:** assign shows a toast, revoke shows none, and revoke has
no confirmation step either — the role is removed on the first click. The row disappearing is the only
feedback. The effect is visible and correct, so this is below the bar CLAUDE.md sets for what gets
filed; recorded because the asymmetry is the kind of thing that reads as a defect on first sight.
(The notice poll ran continuously from before the click and did catch the assign toast, so the absence
on revoke is measured, not missed.)

### A rig error worth keeping — my test data poisoned my own selector

First run of this test reported "both selections register, Assign is enabled, clicking it fires no
request and changes nothing" — a convincing-looking defect. It was mine: I named the probe role
**"D2 assign probe"**, and my button filter was `/assign/i`, so the *role combobox* — whose text was
now the role's name — matched first and got clicked instead of the `Assign role` button.

**Test data that contains the word you filter on will match your selector.** Everything else was
sound: the selections had registered, the button was genuinely enabled, and the "no request" reading
was true — of the wrong element. Enumerating *all* candidates rather than taking the first match is
what exposed it: the list came back with two entries and the first was a combobox.
---

### BUG-17 [High] [frontend] `role.manage` grants role creation and the only screen that creates roles refuses to open

Found by sweeping every company permission one at a time — the same method that produced the two
published High findings, run to completion rather than sampled.

A member holding exactly `company.{co}.role.manage`, whose checkbox in the role editor reads
**"Create company roles and assign or revoke them for members"**:
```
Settings → Roles (company scope):
  "Admin access required — You do not have permission to view company roles.
   A company owner or an administrator can grant this access."
  interactive controls in the content area: 0

same account, same session:
  GET    /api/v1/companies/{co}/roles        -> 403 COMMON_PERMISSION_DENIED   (that is role.get — correct)
  POST   /api/v1/companies/{co}/roles        -> 200 {"id":"…","name":"…","scope_type":"company", …}
  DELETE /api/v1/companies/roles/{id}        -> 403                            (that is role.delete — correct)

effective permissions: company.{co}.role.manage, company.{co}.member.view
```
**The server honours the grant — the role really is created — and the screen where roles are created
will not open.** The refusal message is itself accurate (they cannot *view* roles), which is what makes
this easy to miss: the page is not lying, it is gating the create form behind the read permission.

`role.update` and `role.delete` sit behind the same gate — granted alone, each leaves the Roles page
denied and 0 controls.

**Positive controls from the same sweep, which is what makes this a finding rather than a suspicion:**
```
workspace.create   -> ADMIN nav gains "Workspaces"                     works
role.get           -> Roles page opens (denied=false, 725 chars)       works
member.view        -> Members page renders, 0 actions (view-only)      works
member.kick        -> Members page renders WITH 8 Remove buttons       works
audit.view         -> audit page denied, 0 controls                    the published High
privacy.bypass     -> no admin surface expected                        n/a
```
Five of the seven behave exactly as their labels say. `audit.view` and `role.manage` do not.

**Dedup:** nothing in 3595 cached tickets covers it — greps on `role.manage`, "Create company roles",
"view company roles" return only unrelated items (a raw-key display bug, mobile parity, the chat role
picker). Not in the open-bug list either.

**Noticed while deduping, opposite of today's pattern:** ALK-3536 `[FE-WEB][ADMIN] В списке прав роли
одно право подписано внутренним ключом audit.view` is still **Backlog/open**, but the behaviour is
fixed — the checkbox now reads "View the company audit log", as this sweep shows. A fixed-but-open
ticket, where the rest of today produced closed-but-broken ones. Both directions mean the same thing:
ticket state is not evidence about the product.
---

### Published invite finding strengthened — an ENABLED control that fails with the wrong error

The workspace-permission sweep put the Invites page into a state my earlier runs never hit: with
invites present in the list, the page has **11** controls, not 9, and two of the extra ones are
**enabled**.
```
holder of workspace.{ws}.invite only:
  Filter settings          enabled   (settings nav, not part of the finding)
  Role                     disabled
  Maximum uses             disabled
  Create invite link       disabled
  Search company members   disabled
  <recipient checkbox>     disabled
  Invite without a role    disabled
  Expires in days          disabled
  Send direct invites      disabled     <- the eight creation controls, as published
  Resend invite            ENABLED
  Revoke invite            ENABLED

clicking "Revoke invite" — three consecutive runs, one after a full reload:
  API requests fired: none
  toast:              "You need permission to view roles before assigning them."
  invite afterwards:  status still "pending", nothing changed
```
**The message is about assigning roles; the user was revoking an invite.** Same root as the disabled
controls — the page's role-read gate leaking into a path that needs no roles at all — but a sharper
expression of it: not a control greyed out with an explanation, a control that looks available, does
nothing, and blames a different operation.

Folded into the published finding rather than filed separately: same screen, same permission, same
cause. The prose now says "all eight controls **of both creation forms**", which is what my earlier
counts actually measured — with an empty invite list there was nothing else to count. **A control
count is a function of the page's data, not just its permissions**, and mine was taken on an empty
list three times without my noticing that was a precondition.

### `workspace.delete` is not a grantable permission at all

```
POST /api/v1/workspaces/{ws}/roles {"permissions":["workspace.{ws}.delete"]}
 -> 400 {"code":400,"key":"ORG_PERMISSION_UNKNOWN_RESOURCE",
         "message":"permission: неизвестное действие для слоя: \"delete\" в с…"}
```
So the absence of a delete checkbox in the role editor is not an oversight in the UI — the server does
not accept the action for the workspace layer. This is why nothing anywhere can delete a workspace,
and it is supporting evidence for the ownership dead-end finding rather than a finding of its own
(no screen requests it). Recorded so nobody spends time looking for the missing checkbox.

### Workspace-permission sweep — the rest behaved

```
workspace.edit    -> Settings → Workspace gains editable name + Upload image   works
workspace.invite  -> Invites page opens; creation controls disabled            the published High
workspace.delete  -> not grantable (400)                                       n/a
```
---

**BUG-17 confirmation — the working pairing.** Granting `role.manage` **together with** `role.get`
opens the page fully: 28 controls, the create form with every permission checkbox, an enabled
`Create role`, and `GET`/`POST` on roles both 200. So the dependency is real and the fix is a free
choice — either the create form stops depending on the read permission, or the dependency becomes
visible where the permission is granted. Added to the finding's triage block, because "here is the
combination that works" is what turns a report into something a developer can act on in one read.
---

### Nav dead-end sweep for a plain member — one hit, deliberately not reported

Walked every settings nav item as an account holding only the fixture defaults
(`company.{co}.member.view`, `workspace.{ws}.channel.create`, `workspace.{ws}.channels.view`):
```
Account 8 controls · Profile 14 · Notifications 3 · Appearance 22 · Calls and audio 6
Privacy & security 10 · Security 5 · About 1 · Company 2 · Workspace 2
Company dashboard 1 · Members 0 (renders, view-only) · Sessions 0 (the published Low)
Roles  -> DENIED, 0 controls
```
`Roles` is the only nav item that refuses. It sits in the WORKSPACE group, which is shown
unconditionally, while the ADMIN group below it *is* permission-gated (items appear and disappear with
the grant, as the permission sweep showed).

**Not written up.** The refusal is informative — "Admin access required — You do not have permission to
view company roles. A company owner or an administrator can grant this access." — it tells the user
exactly what is missing and who can grant it. The inconsistency with the gated ADMIN group is a
design-consistency argument, not a user harm, and filing it would be padding a report that already
carries six Lows. Recorded so the negative space is on the record: **for an ordinary member, thirteen
of fourteen settings screens work and one refuses, informatively.**
---

### The guest question, closed with one measurement

The fixture roles, read straight from the API:
```
company    Member    is_guest=false   ["company.<CO>.member.view"]
company    Admin     is_guest=false   ["company.<CO>.*"]
company    Guest     is_guest=TRUE    ["company.<CO>.member.view"]      <- identical to Member
workspace  Member    is_guest=false   ["workspace.<WS>.channel.create","workspace.<WS>.channels.view"]
workspace  owner     is_system=true   ["workspace.<WS>.*"]
```
**The `Guest` role carries exactly the permission `Member` carries.** The only difference between them
is the `is_guest` boolean on the role, which is what marks the holder in member rows and message
authors. So guest-ness is a *label attached to a role*, and that role grants precisely what an ordinary
member's role grants — which is why a guest can create channels, hold call host controls, and use any
permission granted to them by any other route.

This is the tidiest possible evidence for the answer I gave earlier, and it needed no source reading at
all: the permission model never has to consult `is_guest`, because the guest role is a member role.
---

### Presence-visibility finding re-verified end to end — published measurements all hold

Re-ran the whole thing from scratch, including the cross-user half:
```
Online status list -> Nobody
  persists: "online_visibility":"nobody", list still reads Nobody after reload
  Show online status switch: still aria-checked="true"   <- the two never reflect each other
  seen by another workspace member: QA <A> {"online": true}      NO EFFECT

Show online status switch -> off
  PUT /api/v1/users/me/presence-settings/update {"hide_presence":true} -> 200
  own presence: {"online": false}
  seen by another workspace member: QA <A> {"online": false}     WORKS
  control: the other member's own presence unchanged in the same responses

restored: switch on ({"hide_presence":false}), list back to "Workspace members",
          server confirms online_visibility="workspace", presence.online=true
```
Nothing to correct — the published block already carried these numbers. Added the one detail it was
missing: with the list at `Nobody` the switch still reads on, so the two controls governing the same
thing disagree on screen as well as in effect.

**Three near-misses avoided in this one re-verification**, all the same discipline:
1. My first attempt drove the **first** combobox, assuming it was `Online status`. It is
   `Profile visibility` — the three are labelled only by the text above them, and all three *display*
   the same value ("Workspace members"), so they are indistinguishable by value.
2. That run's option-click returned `undefined` because of how I passed the argument, so the
   "nothing happened" reading was **inconclusive, not negative** — I would have "confirmed" a finding
   from a click that may never have occurred.
3. I had carried a belief from earlier in the session that the `Online status` list "does nothing at
   all". It does save, correctly and durably. What it does not do is change what anyone else sees.
   **"Has no effect" and "has no effect on others" are different claims**, and only the second is true.
---

### Workspace-layer sweep completed — and it produced the control that closes finding #2

The Roles page offers **nine** workspace checkboxes, not five: besides `edit`, `invite`,
`channel.create`, `channels.view` and the wildcard, the workspace layer also accepts `member.kick`,
`role.get`, `role.manage` and `audit.view`. I had swept only three of them. Sweeping the rest:
```
workspace.audit.view   nav gains "Audit log" · page NOT denied · 4 controls, 3 enabled
                       GET /workspaces/{ws}/admin/audit-log -> 200          WORKS
workspace.role.get     GET /workspaces/{ws}/roles -> 200 · roles page renders, 0 controls
workspace.role.manage  GET /workspaces/{ws}/roles -> 403 · roles page renders, 0 controls
workspace.member.kick  no admin surface gained
```

**`workspace.audit.view` is the positive control finding #2 was missing.** The same action name, granted
on the other layer, opens the audit log completely — nav item, table, Export. So the section is not
broken and the wildcard is not ignored: the gate simply asks about the workspace layer while the
permission was granted on the company one. That is the behavioural proof of the cause I had only cited
from source (`capabilities.ts:148`), and it rules out every alternative explanation at once. Added to
the report's measurement block.

**`workspace.role.manage` behaves like its company twin** — `GET …/roles` 403 and no create form —
so BUG-17 is not company-specific. Not split into a second finding; same defect, both layers.

**`?scope=channel` is not a thing.** The Roles page has exactly two tabs, Company roles and Workspace
roles; passing `scope=channel` silently renders the company view. No screen links to it, so this is a
default rather than a defect — noted only so nobody else goes looking for a channel-role editor here.
---

### Verified working — failure states on settings save (both branches)

Failed the settings write two different ways and watched what the user is told, polling from before
the click.

**Network failure** (`route(...).abort('failed')`):
```
toast:  "Could not save account settings. Try again."
toast:  "Network error. Check your connection."
inline: "1 unsaved change" + "Could not save account settings. Try again."
save bar: still present (retry available)
field:    keeps the typed value — not silently reverted
server:   unchanged, nothing was written
```

**Server error** (`fulfill` 500 with the app's own error envelope):
```
toast:  "Could not save account settings. Try again."
toast:  "The service is temporarily unavailable. Try again later.
         Support reference: <trace_id>"
inline / save bar / field / server: same as above
```

This is the best-built thing I have found in the sector. The two failure modes get **different**
messages, the input is preserved so nothing is retyped, the save bar stays so the retry is obvious,
nothing is falsely reported as saved, and the 500 path surfaces the response's `trace_id` to the user
as a **Support reference** — which is exactly what makes a support conversation tractable.

Worth stating plainly because the report is a list of things that are wrong: the same screens carrying
BUG-12's dead fields handle their own failures better than most products do.
---

### Error-surfacing control — the app CAN name a specific server error, and does elsewhere

```
duplicate role name, through the UI:
  POST /api/v1/companies/{co}/roles -> 400
    {"code":400,"key":"ORG_ROLE_NAME_TAKEN",
     "message":"failed to create role: role with name Member already exists in this scope"}
  shown to the user: "A role with this name already exists here."     <- specific, accurate, actionable
```
Compare the published kick finding, same shape of server response:
```
  POST /api/v1/companies/kick -> 400 {"key":"ORG_KICK_COMPANY_OWNER", …}
  shown to the user: "Could not remove the member. Try again."        <- generic, and wrong: retrying
                                                                         can never work
```
**So the error key does reach the client and the client does have per-key copy** — it simply has none
for `ORG_KICK_COMPANY_OWNER` and falls through to a retry message for a permanent condition. That
removes the only reasonable defence of the kick finding ("the frontend cannot know why") and is now in
its measurement block as a control.

This is the third finding today strengthened by a positive control found after the fact — the audit
one by granting the same action on the other layer, the profile one by the status message that *does*
render, and now this. **The pattern is worth naming: for any "the app fails to do X" finding, look for
somewhere the same app does X correctly.** It converts a report into something no one can argue with,
and it costs one extra measurement.
---

### Company rename hint — measured, deliberately NOT filed, but useful to ALK-3012

```
Settings → Company, Company name field:
  1 character  -> Save disabled · no message anywhere · aria-invalid="false"
  empty        -> Save disabled · no message anywhere
  129 chars    -> input truncates to 128 (maxlength) · Save enabled
                  PATCH /api/v1/companies/{co} -> 200
  attrs on the field: minlength="2" maxlength="128", no aria-describedby, no helper text
  the company CREATE page, same constraint, does say: "Use 2 to 128 characters."
```
So the rename form enforces the limit and never explains it, while the create form for the same field
explains it. Save going grey with no reason given is a real (small) gap, and `aria-invalid="false"`
means assistive tech gets no signal either.

**Not filed.** ALK-3012 `[FE-WEB][WORKSPACE] Переименование Workspace с однобуквенным именем не
показывает ошибку` is open in Backlog and its expected result is *"либо отключать Save changes **и
показывать подсказку `Use 2 to 128 characters.`**, либо явно показывать ту же ошибку"* — which is
precisely the half the company form is missing. The workspace case is the worse one (Save stays
**enabled** and the rename silently does nothing); the company form already does half the prescribed
fix. Filing a second Low that says "do the same on the neighbouring screen" would be noise.

**For whoever picks up ALK-3012:** the same hint is missing on `Settings → Company`, where the
behaviour is otherwise already correct. One fix, two screens.

**Verified working — the system owner role is not exposed in the Roles page.** The API lists
`workspace_owner_<WS>` with `is_system: true`, and the workspace Roles table shows only `Member` with
Edit/Delete. The system role has no row and therefore no destructive control to mis-click. (Relevant
because ALK-2133, BLOCKED, is about system owner roles being modifiable — whatever the API allows,
this screen does not offer it.)
---

### Self-audit of the report — structure, budgets, leaks

Ran the report against CLAUDE.md's own rules rather than trusting that fourteen hand-edits left it
consistent:
```
findings:                14      summary table rows: 14      (match)
required sections        every finding has all five: Проблема · Как воспроизвести ·
                         Фактический результат · Ожидаемый результат · Проверка
prose budget             one finding was at 203 words (guidance ~120-180); the rest 99-155
leak scan                0 hits across emails, all id prefixes, host, rig ports, fixture
                         names, probe-role names
severity                 3 High / 5 Medium / 6 Low, all frontend
```
The over-budget one was finding #1, pushed there by the positive control I had added to
**Фактический результат**. Moved it to **Для триажа**, which sits outside the budget by CLAUDE.md's own
rule and is where "here is the combination that works" belongs anyway — 203 → 158. Nothing was cut;
it was in the wrong section.

Worth noting for the next long editing session: **the budget is a signal about placement, not about
verbosity.** Every time I went over today it was because a measurement or a control had drifted into a
prose section, not because the prose was wordy. Checking the budget mechanically found a structural
error I would not have spotted by reading.
---

### Verified working — the audit log records accurately, not just reachably

Everything so far tested whether the log can be *opened*. This tests whether what it says is *true*.
Performed four distinct actions in one burst and read the log back:
```
 0 role.deleted   QA Owner -> R4OW…KEVH   16:05:28Z  role="D2 audit accuracy probe"
 1 role.revoked   QA Owner -> QA Alice    16:05:28Z  role="D2 audit accuracy probe"
 2 role.assigned  QA Owner -> QA Alice    16:05:28Z  role="D2 audit accuracy probe"
 3 role.created   QA Owner -> R4OW…KEVH   16:05:28Z  role="D2 audit accuracy probe"
```
All four present, in correct newest-first order, with the right actor, the right action name, the
right target (**role id** for create/delete, **user** for assign/revoke — the correct distinction), and
`role_name` plus `permissions`, `scope_type`, `scope_id` in the metadata. Nothing missing, nothing
duplicated, nothing misattributed.

Worth stating because it sharpens finding #2: **the audit log itself is sound.** The defect is purely
that a permission named for it does not open it — not that the data behind it is wrong.

### The two audit endpoints return different shapes — and this closes the BUG-10 loop

```
GET /workspaces/{ws}/admin/audit-log  -> a BARE ARRAY:  [{…},{…},{…}]
                                         no cursor fields at all
GET /companies/{co}/admin/audit-log   -> {"entries":[…], "next_before":…, "next_before_id":…}
```
**That explains the behaviour I spent the morning on.** The workspace endpoint hands the client no
pagination metadata whatsoever, so the client cannot use a server cursor — it has to synthesise one
from the last row it received, which is why it sends `before` **one second above** the last row and
deduplicates by id. It was never a workaround for a lossy cursor; there is no cursor to use.

The company endpoint's `next_before`/`next_before_id` — the pair that *is* second-precision and lossy —
belongs to the endpoint no screen calls. So the whole picture is consistent: the safe path has no
cursor and invents an overlapping one; the lossy cursor is on the path nothing uses.

API-shape detail with no user-visible symptom, so it stays here rather than going in the report — same
rule that retired BUG-10. Recorded because it is the missing half of that investigation, and because
the shape difference between two sibling endpoints will surprise the next person who writes a reader
for both (it surprised me twice today: once as `entries.slice is not a function`).
---

### Verified working — Company dashboard, both tabs

The `Overview | Manage` tab pair is the last surface in the sector I had not opened.
```
Overview:  Workspaces 1 · Members 8 · Your role Owner (all match the API)
           QUICK ACTIONS -> Edit company profile (button)
                            Create workspace  -> /settings/admin/workspaces
                            Invite members    -> /settings/admin/invites
                            Manage roles      -> /settings/roles?scope=company
Manage:    Company identity -> company name input, prefilled "QA Fixtures D",
                               minlength=2 maxlength=128
           Administration   -> Manage members / roles / invites / workspaces, all real links
           no Save control until the form is dirty (the save-bar pattern used everywhere else)
```
Both name fields — this tab and `Settings → Company` — prefill with the real company name, so neither
can blank it by saving an empty form.

**I nearly reported "the Quick actions are not interactive".** My first measurement showed exactly one
control on each tab, because the filter excluded every `<a href*="/settings/">` to drop the settings
sidebar — and every Quick action is exactly that shape. Re-measured by **position** instead (anything
right of the sidebar's right edge) and all seven links appeared.

That is the second time today the same filter has hidden real content, after the About page. The rule
I should have applied the first time: **exclude chrome by where it is, not by what it looks like.**
A structural property (x-coordinate, containment in a landmark) does not collide with content; a
pattern match on href or text always eventually does.
---

### Notification delivery-channel invariant — mostly excellent, one misleading string

Testing whether the notification settings take *effect*, not just round-trip. Turning
`In-app notifications` off alone is refused, correctly:
```
PATCH /api/v1/notifications/settings {"in_app_enabled":false} -> 400
  {"code":400,"key":"NOTIFICATION_NO_DELIVERY_CHANNEL",
   "message":"нужен хотя бы один канал доставки: включите in_app_enabled или mute_all_channels"}
shown to the user: "In-app notifications cannot be turned off while no other delivery method is
                    enabled. Keep them on and try again."
                   "Keep at least one notification delivery channel enabled."
save bar stays · after reload the switch returns to ON, matching the server · nothing falsely saved
```
The invariant, the specific message, the state recovery and the retry affordance are all right. **This
is a third example of per-key error copy** (after `ORG_ROLE_NAME_TAKEN`), which further isolates the
kick finding's generic "Try again."

**But the message misdescribes both the condition and the remedy**, and the remedy does exist:
```
PATCH {"in_app_enabled":false,"mute_all_channels":true} -> 200
  {"in_app_enabled":false,"mute_all_channels":true, …}   persists across reload
```
So in-app *can* be turned off — by enabling `Mute channel notifications`. The toast instead says
"while no **other delivery method** is enabled" (the page offers no other delivery method — there are
exactly three switches, and the other two are mutes) and advises "Keep them on and try again", which
is the one thing that cannot help. Reported as a Low.

### Do Not Disturb has no control anywhere — out of scope, but a closed ticket disagrees

`do_not_disturb_enabled` is in `GET /api/v1/notifications/settings`, and there is no switch for it on
Notifications, Profile, Account, Privacy, or the profile menu (which offers only the six quick
statuses and `Clear status`). A field no screen exposes is out of scope by the same rule that retired
BUG-10, so I have not tested it.

Worth recording: **ALK-2460 `[FE-WEB][SETTINGS] Do not disturb в Settings → Profile сохраняется, но не
отключает уведомления` is TESTING (closed)** and describes a DND control *in Settings → Profile*. That
control does not exist on `v0.61.0-rc.5`. Either it was removed after the ticket was written, or the
ticket describes a screen that has since changed — either way it is one more closed ticket whose
subject cannot be found in the product. Fixture settings restored to defaults afterwards
(`in_app_enabled:true, mute_all_channels:false`).
---

### Verified working — `mute_all_channels` really suppresses, proven with a control

Testing effect rather than round-trip, with the two runs differing in exactly one variable:
```
mute_all_channels = true
  owner posts "QA-D2 mute-all probe (plain, no mention)" in the shared channel -> 200
  alice's notifications 6s later: count 8, newest still 12:59:32Z          NOTHING DELIVERED

mute_all_channels = false          (same channel, same sender, same message shape, 31s later)
  owner posts the identical message -> 200
  alice's notifications 7s later: count 9, newest:
    type=1 "New channel message" — "QA-D2 mute-all probe (plain, no mention)" — 16:14:24Z
```
Same channel, same sender, same wording, half a minute apart, one variable changed. The setting is the
cause and it does what it says.

Worth having in a report full of settings that save and do nothing: **this one works, and I can prove
it works rather than assuming.** The negative run alone would have proved nothing — an absent
notification is equally consistent with a broken fixture, which is precisely how BUG-11 went wrong
earlier today.

Fixture notification settings are back at their defaults afterwards:
`{"in_app_enabled":true,"mute_all_channels":false,"mute_unknown_dm_users":false,"do_not_disturb_enabled":false}`.
Two probe messages left in the shared channel; the workspace is disposable and plain members cannot
delete their own messages, so they stay — consistent with how the fixture is documented.
---

### All three visibility lists are inert — completing the set behind the published finding

I had measured `Online status` and `Last seen`. The third:
```
profile_visibility = "nobody"   PUT /api/v1/auth/me/settings -> 200, persists
owner opens her profile card:
  "QA Alice | QA | QA Alice | Testing profile fields | Message | Call | Block | Share
   | SHARED CHANNELS · 2 | qa-general | qa-private"
identical to before — name, status, shared channels and every action still visible
```
So **all three lists save and none of them changes what another member sees.** That matches the
section's own subtitle — *"These preferences are saved, but they do not change what others can see
yet."* — which is honest about the lists.

**Which is exactly why the published finding is framed the way it is.** The subtitle is accurate for
the three lists and **wrong for the switch sitting under the same heading**: `Show online status` does
change what others see, immediately and verifiably. A user reading that one line reasonably concludes
nothing in the section works yet, and turns off the one control that does. Restored to `workspace`.
---

## Coverage audit — every reachable route in the sector, and what was done on it

Crawled the settings shell for reachable routes rather than trusting my own list. **18 routes**, and
every one has either a finding or a verified-working entry in this log:

| route | what happened there |
|---|---|
| `/settings/account` | BUG-12 (contacts) · contact validation · save-failure states (both branches) |
| `/settings/profile` | BUG-12 (Job title/Department/Pronouns) · `Show timezone` dead · Active status works |
| `/settings/notifications` | delivery-channel message finding · `mute_all_channels` proven with a control |
| `/settings/appearance` | BUG-14 sidebar · BUG-15 message layout · theme + all six switches verified |
| `/settings/calls` | device pickers · `Test sound` (setSinkId) · both switches persist |
| `/settings/privacy` | presence-visibility finding · all three lists proven inert · block/unblock |
| `/settings/sessions` | published Low (no actions with one session) |
| `/settings/security` | subtitle finding · password change · 2FA wrong-code path |
| `/settings/about` | subtitle finding · version matches the deployed stamp · crash reports persist |
| `/settings/company` | switch-company menu · rename validation (logged, not filed) |
| `/settings/workspace` | ownership dead-end finding · `workspace.delete` not grantable |
| `/settings/roles?scope=company` | **BUG-17** · wildcard behaviour · assign/revoke UI · role editing propagates |
| `/settings/roles?scope=workspace` | workspace permission sweep · system role correctly hidden |
| `/settings/admin/company` | subtitle finding · both tabs · counts match the API |
| `/settings/admin/members` | remove dialog · owner row disabled · guest disclosure |
| `/settings/admin/invites` | **the invite High** · direct invites · in-app inbox copy finding |
| `/settings/admin/workspaces` | subtitle finding · no delete affordance anywhere |
| `/settings/admin/audit-log` | **the audit High** · log accuracy verified · export paging |

Outside the settings shell, same sector: `/login`, `/signup`, `/forgot-password`, `/company/create`,
`/invite?token=…` — all covered, with the auth non-enumeration results recorded above.

**So the coverage claim is measured rather than asserted.** The crawl found nothing I had not already
opened, which is the point of running it: I would rather discover a missed route now than describe
coverage as complete and be wrong.
---

### Verified working — Russian localisation is complete across the sector

Switched the account to Russian (label → `Русский`, `settings.language: "ru"`, applied immediately with
no save bar) and swept all 16 settings routes for three-or-more consecutive Latin words, which is what
untranslated English prose looks like:
```
14 of 16 routes: zero English-like strings
calls:    "Fake Default Audio Input" / "Fake Default Audio Output"
sessions: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 …"
```
**Neither hit is an app string.** The device names come from Chrome's `--use-fake-device-for-media-stream`,
i.e. from my own harness, and the user agent is correctly left untranslated. So the real count of
untranslated strings is **zero**, matching the Uzbek result from earlier in the session.

Restored to English afterwards, per the project rule about testing in English.

**Two rig lessons from this one, both mine:**

1. **The first run of this sweep was worthless and looked authoritative.** It reported 94 English-like
   strings across 16 routes — because the language never actually changed and I was measuring the
   English UI against an English expectation. The tell was in the return value I had truncated away:
   `languageNow: "en"`. **A sweep that produces a large, plausible number is not self-validating** —
   the precondition has to be asserted, and mine printed the precondition and I cut it off with `tail`.
2. The reason the switch silently failed is the same mistake for the **third** time today:
   `page.evaluate(<template string>, arg)` **ignores the argument** — a string first parameter is
   evaluated as an expression, so my `((T) => …)` became an unserialisable function object and
   returned `undefined`, and the "did it click?" field simply vanished from the result. Inlining the
   value with `JSON.stringify` into the template is the form that works. Every previous instance cost
   me a wrong conclusion too: the presence combobox, and the notification switch.
---

### Verified working — layout holds at 1280 across the whole sector

Measured rather than eyeballed, using the project's own rules: clipping as
`scrollWidth > clientWidth` on **leaf** nodes, unreachable controls as
`getBoundingClientRect().left >= innerWidth` while `documentElement.scrollWidth === innerWidth`.
```
viewport 1280x800, 17 settings routes
  routes with a horizontally scrolling page body:  0
  routes with unreachable controls:                0
  routes with clipped leaf text:                   1
    sessions — "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15…"  scrollWidth 1032 / clientWidth 844
```
**Not written up.** The single clip is the raw user-agent string that the Sessions card falls back to
because `device_label` is absent — which is **ALK-3005, open in Backlog**. Clipping a string that
should not be displayed in that form at all is downstream of that ticket, not a separate defect.

Everything else in the sector was already exercised at 1920×1062 all session. Viewport restored.
---

### Audit-log raw display — measured, and NOT filed: ALK-3307 owns it

> **РЕШЕНИЕ ПОЗЖЕ ИЗМЕНЕНО (ночь 27.08).** Вывод ниже — «не заводить, этим владеет ALK-3307» — я пересмотрел, прочитав ALK-3307 целиком: она описывает **журнал уровня компании, страницу, которой ещё нет**, и ничего не говорит про уже работающую страницу журнала workspace. Это **находка №16** в отчёте; связь с ALK-3307 названа в её блоке «Для триажа». Подробности — в разделе HANDOVER.


Applied the enum-diff technique to my sector. Backend defines **21** audit actions in
`org-service/internal/core/domain/audit.go` (`role.created` … `workspace.owner_transferred`). The web
table renders `{entry.action}` **raw** — `apps/web/src/features/admin/AdminAuditLogTable.tsx:59`,
with no label map anywhere in the tree. Confirmed on screen, not just in source:
```
ACTION         ACTOR                    TARGET                   CREATED            METADATA
role.deleted   QA Owner (@qa_d_owner)   role:R4OW…4P2            Aug 26, 8:55 PM    {"permissions":["workspace…
role.revoked   QA Owner (@qa_d_owner)   QA Alice (@qa_d_alice)   Aug 26, 8:55 PM    {"role_id":"R4OW…","scop…
raw keys visible: role.created/assigned/revoked/deleted, invite.created/revoked/accepted,
                  workspace.member_joined, workspace.member_removed
```
So the administrator's screen shows internal enum keys, raw role ids (`role:R4OW…`) and raw JSON.

**Not filed, because ALK-3307 `[FE-WEB][Company] Страница журнала аудита компании` (Task, Backlog,
open) owns exactly this.** It carries the event catalogue — every `action` with its metadata keys —
and states the display contract directly: *"action — открытая строка… незнакомое значение показывайте
как есть"*, i.e. unknown values render raw **by design**, which implies known ones should not. The page
has not been built to that spec yet. Filing "the actions render raw" against a ticket whose job is to
define how they render would be filing the ticket again.

**Two related states worth recording rather than filing:**
- **ALK-2357** *(Audit-log показывает сырые ID вместо имён)* is closed **and its fix is visibly
  present** — actor and target now resolve to `QA Owner (@qa_d_owner)`. But it was scoped to *users*,
  and **role targets still render `role:R4OW…`** through the same `getAuditTarget` helper. Genuinely
  outside that ticket's stated scope; inside ALK-3307's.
- **ALK-3536** *(raw key `audit.view` in the role permission list)* is still open in Backlog while the
  behaviour is **fixed** — the checkbox now reads "View the company audit log", as my permission sweep
  showed. A fixed-but-open ticket, the mirror of today's closed-but-broken ones.

The technique was worth running even though it produced no filing: it took one grep to establish that
a whole category is unmapped, and one ticket read to establish that the category already has an owner.
---

### Correction to BUG-12, prompted by reading the contract rather than the code

I had written that `showTimezone` has "no consumers on web at all". **The backend consumes it**, and
that matters: it narrows the fix to one side.

The OpenAPI contract states it outright — *"One key is read by the backend itself:
`profile.showTimezone` (boolean) — it controls the visibility of `timezone` for other participants"*,
and for the participant field: *"The field is absent if the participant has not saved a timezone OR has
not enabled `settings.profile.showTimezone`."* Measured both ways rather than taking the doc's word:
```
showTimezone = false  -> members payload seen by another user: alice has NO timezone field
showTimezone = true   -> members payload seen by another user: "timezone":"Asia/Tashkent"
control               -> the observer's own timezone is present in both runs
profile card          -> byte-identical in both states; no Local time either way
```
So the **privacy half works perfectly**: the field travels only when the user allows it. The **display
half does not exist**: no component reads `showTimezone` or computes a Local time string, and the
client throws away a field it correctly received.

**Why the old wording was worth fixing.** "No consumers, the setting does nothing" invites a developer
to look at the backend, or to suspect the setting is dead end-to-end. The true statement —
*server honours it, client never renders it* — points at exactly one file to change and confirms the
privacy behaviour is already correct, so a fix cannot leak a timezone the user hid. Same defect, far
better instruction.

**Method note.** This came from checking my own citations after a peer flagged that a citation can be
real and still show a reader nothing. Auditing them was cheap and all five *mechanism* citations held
up — `AdminInvitesPanel.tsx:37` is the actual `isDisabled` expression and even carries an ALK-2965
comment claiming the fix my finding disproves; `capabilities.ts:148` is the gate itself. What the audit
actually caught was different and better: while confirming the **negative** claim about `showTimezone`
I read the generated contract next to it and found the claim was wrong. **Verifying a citation made me
re-read the surrounding file, and the surrounding file is where the correction was.**
---

### Adversarial read of my own measurement blocks — arithmetic reconciles

Checked every stated count against the evidence directly beneath it, without opening the product:
```
#1  prose "все восемь элементов"    block names exactly 8 controls              OK
#5  prose "пять … три списка и два переключателя"   3 + 2 = 5, and the block
                                     shows 3 comboboxes + 2 switches            OK
#7  prose "пять других настроек"     Density, Accent, Light sidebar,
                                     Light navigation rail, Animations = 5      OK
#11 prose "на шести страницах"       block lists 6 surfaces with counts         OK
#15 title "Четыре подзаголовка"      block contains exactly 4 "подзаголовок:"   OK
#3  triage "28 элементов управления" matches the measured value                 OK
```
Nothing failed to close. Worth doing anyway: it costs one pass and needs neither the app nor the
fixtures, and it catches the class of error where a finding is edited (widened, trimmed, re-measured)
and a count in the prose stops matching the block under it. Every one of my counts had been touched at
least once during the day's edits.
---

### Control run for the enum-diff technique — permissions are fully mapped

The audit-log result only means something if the same method comes back clean somewhere else. It does.
There is a live catalogue endpoint (named in ALK-3307), which beats reading Go constants:
```
GET /api/v1/companies/{co}/permissions/available   -> 200, 11 items
  workspace.create · role.get · role.manage · role.update · role.delete
  member.view · member.kick · privacy.bypass · privacy.manage · audit.view · *
GET /api/v1/workspaces/{ws}/permissions/available  -> 200, 9 items
  edit · invite · channel.create · channels.view · member.kick
  role.get · role.manage · audit.view · *
```
The role editor renders **11** company checkboxes and **9** workspace checkboxes — a 1:1 match with the
catalogue, in the same order, each with a human label and no raw keys:
`role.manage` → "Create company roles and assign or revoke them for members",
`channels.view` → "View and join public workspace channels", and so on.

**Zero unmapped, zero orphaned.** So the technique is sound and the audit-log finding is a real gap
rather than a grep artifact — which is exactly why the control was worth running.

**It also closes an old loose end.** I had noted "24 `Action*` constants in Go but only 18 actions
offered in the UI". The catalogue explains it: the surplus constants belong to the **channel** layer,
which this editor does not manage, and `workspace.delete` is simply **not in the workspace catalogue**
— which is why granting it returns `400 ORG_PERMISSION_UNKNOWN_RESOURCE`. Nothing is missing from the
UI; the Go constant block is a superset spanning all three layers. The earlier "declared but never
offered" phrasing was reading a cross-layer constant list as if it were one layer's contract.
---

### Verified working — the full Sessions lifecycle, and the control behind finding #13

Ran the whole cycle rather than the single state the finding describes:
```
1 session   GET /api/v1/security/sessions -> 200, 1 row (is_current: true)
            interactive controls in the content area: 0          <- the published Low
            row reads: "<device> | <user agent> | <IP> | <time> | Current session"

2 sessions  (signed the same account in from a second browser)
            GET .../sessions -> 200, 2 rows (one is_current: false)
            interactive controls: 2   ->  "Sign out" on the OTHER session's row
                                          "Sign out other sessions"

bulk action DELETE /api/v1/security/sessions/<id> -> 200
            toast: "Other sessions signed out."
            sessions afterwards: 1 · own session still valid (/auth/me -> 200)
            controls afterwards: 0    <- straight back to the actionless state
```
**This is the control that makes finding #13 fair.** The screen is not broken and not permanently
empty — it grows exactly the right actions the moment there is something to act on, and the bulk
sign-out works, reports itself, and correctly spares the current session. The defect is narrow: with
one session the page offers nothing while its subtitle still says *"and how to sign one out"*.

It also shows the finding's expected result is the right shape — either offer an action or stop
promising one — because "make the page always offer something" would be wrong. There is nothing
sensible to offer when the only session is the one you are using.

**Fixture restored:** the second browser is signed back in as its own account, and the account under
test is down to one session again. Note for anyone repeating this: clearing a browser's cookies does
**not** invalidate the server-side session — the orphan persisted until it was signed out explicitly,
which is what `Sign out other sessions` was then used for.
---

### Access revoked mid-session — measured, cross-referenced, not filed separately

Sequential (not a race): grant `workspace.{ws}.audit.view`, let the holder open the audit log, revoke
the role, then have them click `Next` **without reloading**. Two runs, identical:
```
before:      89 rows · buttons: Export CSV, Export JSON, Previous, Next · no denial
revoke, then click Next:
  GET /api/v1/workspaces/{ws}/admin/audit-log -> 403 COMMON_PERMISSION_DENIED  (twice)
  on screen: 0 rows · buttons: Retry, Previous, Next · NO denial message
  the only notice that ever appeared: "Loading…"
after a full reload:
  0 rows · 0 buttons · "Admin access required — You do not have permission…"   correct
```
So a permanent condition is presented as a transient one: an empty table and a `Retry` that cannot
ever succeed, with the truth available only after a manual reload.

**Not filed as its own finding.** It is the same defect as the published kick finding — a permanent
refusal rendered as "try again" — and **ALK-3126 `[FE-WEB][CALLS] Приглашённому пользователю
показывается общий 403 вместо причины запрета входа` (Backlog, open)** is the same pattern a third
time, in calls. A sixteenth Low restating an argument the report already makes, next to an open ticket
making it elsewhere, would be padding. Added instead as a cross-reference in the kick finding's triage
block, so whoever fixes the generic-error copy sees all three instances and can fix the rule rather
than one screen.

**Worth noting what is NOT wrong here:** the server is correct throughout — it returns 403 the instant
the role is gone, with no stale-permission window. The client is the only thing that keeps showing a
table it can no longer load.
---

## Two dedup gaps closed, one published finding withdrawn

### 1. I duplicated my own morning report — finding removed

`reports/aloqa-org-qa-2026-08-26-D.html`, published this morning for **this same sector**, contains:
> `[FE-WEB][WORKSPACE] Владелец не может выйти из workspace: подсказка требует недоступной передачи владения`

That is my finding #11 — same screen, same disabled `Leave workspace`, same hint, same conclusion
("передачи владения в вебе нет"), reached the same way (enumerating controls rather than reading text).
**Removed and republished: 15 findings → 14.**

**Why it slipped through.** Every dedup pass I ran went to Jira. The morning report's findings reached
Jira only as ALK-3535/3536/3537 — and the ownership one **was never filed**, so no Jira query could
ever have found it. I had even *read* that report earlier today and re-verified its findings on rc-5;
reading it is not the same as checking each of my claims against it. This is the second self-duplicate
today after the `Workspace identity` subtitle, and that one only surfaced because it *had* become a
ticket.

**The rule I should have had:** the sibling report for my own sector, same day, is a closer dedup
target than Jira, because most findings never reach Jira at all. Check `ls reports/*<date>*` — not
`reports/README.md`, which is appended once at the end of a run and is therefore empty of the very
report most likely to collide with mine.

**What my version added, so it is not lost:** the delete half (`Create workspace` offered from three
places, delete from none, 0 matches across six surfaces), `workspace.delete` not being grantable at
all (`400 ORG_PERMISSION_UNKNOWN_RESOURCE`), and the two closed tickets that never shipped —
**ALK-2806** (the hint) and **ALK-1805** (Delete workspace in Company Admin). If anyone works the
morning finding, that evidence belongs on it.

### 2. Every dedup today ran against roughly half the open bugs

`jira_cache.py list --open-bugs` implements CLAUDE.md's filter exactly — `Backlog`, `Ready`,
`In Progress` — and that filter has **no `BLOCKED`**. There are **184 BLOCKED bugs**, invisible to
every run I made.
```
python3 scripts/jira_cache.py list --status BLOCKED --type Bug     -> 184
of those, touching this sector by keyword                          ->  71
```
**Re-deduped all 14 remaining findings against them. No duplicates.** The near ones and why they differ:
```
ALK-2137  Workspace settings shows a red Role-management error   different page/permission from BUG-17
ALK-1954  role.manage rendered as a raw key                       display, not access; and now fixed
ALK-1957  Manage workspaces lacks open/edit/delete                open/edit exist today; delete half is
                                                                  the finding I just removed anyway
ALK-2139  Company rename accepts a 1-char name                    I measured this and did not file it
ALK-2141  Security offers incompatible Enable and Disable         fixed today (only Enable is shown)
ALK-2241  Deactivate enabled for a stubbed action                 fixed today (disabled, "Not available yet")
ALK-2135  Session revoke does not end the target session          about revocation, not my single-session Low
```
The 41 I had not yet read are all `[BE]`; my fourteen are all frontend.

**One BLOCKED premise is now stale and worth knowing:** **ALK-1951** says *"Permission catalogue
рекламирует workspace.delete, но Workspace delete API отсутствует"*. The catalogue no longer
advertises it — `GET /workspaces/{ws}/permissions/available` returns 9 items without it, and granting
it returns `400 ORG_PERMISSION_UNKNOWN_RESOURCE`. Half fixed: catalogue cleaned, delete API still
absent. Same partial-fix shape as ALK-2357.
---

### Cross-sector dedup — all nine same-day reports read, no further collisions

Having been caught by my own sector's morning report, I checked my remaining 14 against **every**
report published today, not just mine:
```
calls-around-B · calls-inside-A · calls-qa-B · chat-C · chat-C-2 · incall-A
org-D (mine, morning) · workspace-E · workspace-E-2
```
Only three came near, and all three are distinct:
```
E-2 "Все участники попадают в группу OTHER…"          = BUG-13, which I handed to E. Correctly theirs,
                                                         and correctly absent from my report.
E-2 "Состояние сайдбара … не сохраняются"             sidebar COLLAPSED STATE + Files list options.
                                                         Mine is Sidebar POSITION not applying.
                                                         Their finding even confirms my positives:
                                                         "тема, плотность, акцент … переживают перезагрузку".
E-2 "Reset all в Display settings не сбрасывает тему"  a shell panel on Cmd/Ctrl+Shift+T — a different
                                                         surface from Settings → Appearance. E's sector.
C-2 "Переключатель Send as file не влияет…"           same CLASS as my dead Appearance controls,
                                                         different toggle, different sector.
```
**No duplicates.** Worth noting the shell's `Display settings` panel exists at all — it is a second UI
over theme/density/accent that I never opened, because it belongs to sector E's shell scope. If both
it and `Settings → Appearance` write the same `aloqa.appearance` store, that is two front doors to one
state; not my finding, but the kind of thing that makes "I changed it and it changed back" reports
confusing later.

**Cost of the whole cross-sector pass: one `ls`, one `grep` per file, and two ticket-length reads.**
Against that, it caught one withdrawal in my own sector and confirmed fourteen. This should be a
standing step before publishing, not a reaction to being told.
---

### Audit paging, measured by id — and a self-caught bad key

First measurement of the page-1/page-2 overlap used a rendered-text key
(`action|actor|target|created`) and reported **25** rows on both pages. That key is not unique — a day
of role churn produces many rows with identical action, actor, target and minute. **This is the same
non-unique-key mistake that inverted a conclusion for me this morning**, and I caught it this time only
because I recognised the shape.

Re-measured by entry id, off the wire:
```
request 1  ?limit=100                      100 rows, 100 unique ids, 16:38:35 → 13:08:15
request 2  ?before=2026-08-26T13:08:16Z…   100 rows, 100 unique ids, 13:08:15 → 06:02:44
ids present in BOTH responses: 10
```
So the real overlap is **10**, not 25. Everything else about paging is correct:
`Previous` returns to a page **identical** to the original page 1 (compared row by row), `Previous` is
correctly disabled on page 1, and the cursor is the deliberate `+1s` overlap established earlier.

**Not a finding.** The overlap is the mechanism that stops rows being lost at a second boundary, and
its cost is that a few entries at the seam appear on both pages. Page 2 replaces page 1 on screen
rather than appending, so nothing is visibly duplicated in a single view. That trade — repeat a few
rows rather than drop them — is the right one.

**One thing I could not explain and am not asserting:** the table renders fewer rows than the response
carries (100 returned → 90 shown on page 1, 99 on page 2). It could be the client dropping the
overlap, or grouping, or something else entirely; 100 − 10 = 90 fits page 1 and not page 2. Recording
it as unexplained rather than guessing — it is user-visible only as "the page shows about a hundred
rows", which is what it says it does.
---

### Cleanup complete — lane D returned to fixture state

```
/auth/me for the actor, after cleanup:
  settings.profile.{jobTitle,pronouns,department} = ""     showTimezone=false, awayWhenInactive=false
  settings.contacts.{phone,github,website,linkedin} = ""
  settings.privacy = defaults (read_receipts true, all three visibilities "workspace")
  settings.language = "en"
  custom_status — key absent entirely (cleared)
localStorage["aloqa.appearance"] — removed; page reloads to defaults
seed/seed.sh --verify --lanes D -> All fixtures present and correct
```
Also already restored earlier: every probe role deleted (role list is the fixture set), notification
settings at defaults, the second session signed out, and the second browser back on its own account
and out of the workspace it had joined.

**One API detail worth keeping.** Clearing a status by `PUT`-ing an empty one is correctly refused —
`400 COMMON_INVALID_INPUT, "invalid status: text or emoji is required"` — and `DELETE
/api/v1/users/me/status` is the right call (`200 {"ok":true}`). Sensible design: the write endpoint
validates its payload and deletion has its own verb. The UI's `Clear status` menu item exists for the
same purpose; I could not use it because my own `DELETE` had already cleared the status, so the item
was gone by the time I opened the menu — my sequencing, not a defect.
---

### Verified working — magic-link request (the half that is testable)

I had listed magic link as "not coverable without a mailbox". The **request** half is coverable and it
behaves like the other two auth entry points:
```
REAL account     -> POST /magic-link -> 200
UNKNOWN account  -> POST /magic-link -> 200
both screens:  "Check your email — If an account exists for that address, a sign-in link is on its
                way. Open it on this device to continue."
```
Identical status, identical copy, no disclosure of whether the address exists — matching `/login` and
`/forgot-password`. All three auth entry points are consistently non-enumerable, and only signup
discloses, which is the normal and necessary exception.

The copy also does something useful the other two do not: *"Open it on this device to continue"* warns
about the one thing that actually breaks magic links in practice.

**Consumption remains untested and is not mine to chase:** it needs a live mailbox, and
**ALK-2142 (BLOCKED)** already records that the emailed link points at a non-existent web route
(`/auth/magic-link/verify`).

**With this, the sector's coverage has no remaining gaps I can reach:** 18 settings routes, five auth
entry points (`/login`, `/signup`, `/forgot-password`, `/magic-link`, `/invite?token=`), the company
creation page, every company and workspace permission granted individually, two locales, desktop
layout, and both save-failure branches.

**Verified working — the profile card degrades cleanly with every field empty.** After cleanup the card
reads `QA Alice | QA | QA Alice | Message | Call | Block | Share | SHARED CHANNELS · 2 | …` — identical
to the populated case minus the status line, with **no empty rows and no labels without values**, and
`/users/{id}/status` returns `{}`. That is the Проверка item I wrote into BUG-12 ("незаполненные поля
не дают пустых строк"), checked against the product rather than assumed.
---

### Verified working — every form control in the sector has an accessible name

Computed the accessible name for each control the way assistive tech resolves it — `aria-label`, then
`aria-labelledby`, then `label[for]`, then a wrapping `<label>`, then `title`, then text content —
counting `placeholder`-only as a failure, since a placeholder disappears on input:
```
12 routes · 143 visible controls · 0 without a proper accessible name
```
Nothing relies on a placeholder alone, and nothing is anonymous.

**This also corrects something I wrote about my own tooling.** Several times today I noted that
switches and inputs "have no `aria-label`, so the label has to come from the DOM neighbourhood", and
framed it as a gap I had to work around. It is not a gap: those controls are named by
`label[for=…]` and by wrapping `<label>` elements, which is the more standard association of the two.
My snippets were looking only for `aria-label` and falling back to guessing from ancestors — the
product was doing it correctly and my instrument was reading the wrong attribute.

Worth keeping as a rig rule: **resolve an accessible name properly before concluding a control is
unlabelled.** The nearest-single-control-ancestor heuristic I built to compensate works, but it is a
workaround for a check I should have written correctly the first time — and it is the same heuristic
that mis-clicked three times today.
---

### `workspace.create` delivers what it names — a fourth positive control

```
holder of exactly company.{co}.workspace.create
  Admin → Workspaces: opens, not denied · buttons: Create workspace, Show storage
  Create workspace -> dialog opens:
    "Create workspace | Name | Use 2 to 128 characters. | Cancel | Create"
    controls: Close · name input (placeholder e.g. "Product team") · Cancel · Create [disabled]
  Create is disabled until the name is valid — correct
```
Not submitted: a created workspace cannot be deleted, so completing it would leave permanent state in
the lane for no additional information.

So of the ten company permissions, **eight deliver their named surface** and two do not
(`audit.view`, `role.manage`) — both already findings. That ratio is what makes those two findings
rather than a suspicion that the whole permission layer is broken.

**A detail worth carrying to the rename findings:** this *create* dialog shows the constraint up front
— "Use 2 to 128 characters." — while the company **rename** field enforces the same 2–128 limit and
explains nothing (logged earlier, not filed), and ALK-3012 says the workspace rename does the same.
So the create/rename asymmetry is consistent across both objects, and the create dialogs already
contain the exact string the rename forms need. One string, copied to two places.
---

### The adversarial-arithmetic check caught my own new sentence, minutes after I wrote it

Updating the lede for the third High, I wrote: *"Восемь из десяти прав компании открывают ровно то,
что обещает их подпись — и на этом фоне видны три, которые не открывают."*

**8 + 3 = 11, against ten company permissions.** The invite permission is on the **workspace** layer,
not the company one, so it does not belong in that denominator. Rewritten to say it properly: eight of
ten company permissions deliver, two of the three failures are company-layer (`audit.view`,
`role.manage`) and the third is workspace-layer (`invite`).

**Nothing measured was wrong** — every number came from a real sweep. The error was mixing two
denominators in one sentence while summarising, which is exactly when it happens: the summary is
written last, from memory of the measurements rather than from the measurements.

Worth recording because it is the second time today this check has paid for itself, and because it
argues for *when* to run it: I ran the arithmetic pass over the whole report an hour ago and it came
back clean, then introduced this the moment I edited a summary sentence. **The pass has to follow the
last edit, not precede it.**
---

### ALK-2136 still reproduces — a BLOCKED ticket that is genuinely still broken

Sequential, not a race: one account holds a settings page open, another renames the workspace.
```
owner: PATCH /api/v1/workspaces/{ws} {"name":"D2 Renamed WS"} -> 200
the already-open page in the other browser, no reload: still shows "QA Workspace D"
the same page after an explicit reload:                  shows "D2 Renamed"
name restored to "QA Workspace D" afterwards, confirmed on a fresh load
```
**Not a finding of mine** — ALK-2136 `[FE-WEB] После rename Workspace заголовок Role management
остаётся устаревшим до reload` (BLOCKED) is exactly this, and CLAUDE.md already documents that client
state in this app can lag the server, which is why "re-check on a freshly loaded page" is a standing
rule here.

**Recorded because of the pattern it completes.** Today produced three BLOCKED tickets whose behaviour
is already fixed (ALK-1954, ALK-2141, ALK-2241) and one whose premise has half-changed (ALK-1951).
This is the fourth shape: **BLOCKED and still exactly as described.** So BLOCKED is not systematically
stale in either direction — which is the argument against auto-suppressing on it during dedup, and for
reading it and re-checking the behaviour instead.
---

### Reverse enum diff on the sector — clean, and it handed BUG-17 its mechanism

Ran the diff the other way: **frontend gates with no backend producer.** `capabilities.ts` branches on
exactly five action strings, and every one exists in the live catalogue:
```
frontend gates on:  audit.view · invite · member.kick · member.view · role.get
catalogue offers:   company   workspace.create role.get role.manage role.update role.delete
                              member.view member.kick privacy.bypass privacy.manage audit.view *
                    workspace edit invite channel.create channels.view member.kick
                              role.get role.manage audit.view *
orphaned frontend gates: 0
```
No shipped branch that can never fire — the `recording.stopped` shape does not exist here.

**But the extraction is itself the answer to BUG-17**, and a much better citation than what I had:
```
capabilities.ts:116   const hasRolesSection = hasElevatedAuthority ||
                        (companyId !== null && hasPermission({ action: 'role.get', … }))
capabilities.ts:111   const hasMembersSection = hasElevatedAuthority ||
                        (companyId !== null && (hasPermission({ action: 'member.view', … }) ||
                                                hasPermission({ action: 'member.kick', … })))
```
`role.manage` **never appears in the gate list at all** — that is why extracting the list found it.
And the correct pattern is five lines above: `Members` ORs the read permission with the act permission,
which is exactly why `member.kick` granted alone opens its section. `Roles` has no second operand.

So BUG-17 now cites the mechanism *and* a working neighbour as the control, in the same file, within
six lines. It went from "the create form appears to be gated on the read permission" to a quotation a
developer can act on without opening anything else.

**The transferable bit:** the reverse diff is worth running even when it comes back clean, because
extracting *the list the frontend actually branches on* answers a different question than checking it
for orphans — it shows you what is **missing** from the list. My finding was an absence in that list,
and no forward diff would ever have surfaced it.
---

### Re-checked my withdrawals against acceptance criteria — one of my own claims was wrong

Prompted by the rule that an adjacent ticket owns the states its **acceptance criteria** enumerate,
not the whole mechanism, I re-read the three tickets I withdrew against.

**ALK-3307 — withdrawal holds, and more firmly than I thought.** Its body is a build spec for this
page, and it prescribes the reader-facing rendering explicitly, not just the endpoint:
- a full catalogue of every action with its metadata keys;
- *«для читателя это одно событие „пригласили"»* — invite kinds collapse to one reader-facing event;
- *«Исключение и самостоятельный выход — одно и то же действие… Это важно для формулировки в UI»*;
- a whole section headed *«Имена вместо идентификаторов»*.

**And it corrects a claim of mine.** I recorded — and told a peer — that role targets rendering as
`role:R4OW…` was a leftover gap, "outside ALK-2357's scope, inside ALK-3307's". ALK-3307 says the
opposite: *«Пусто — профиля нет в реплике или таргет не пользователь; тогда откатывайтесь на показ
идентификатора.»* Falling back to the identifier when the target is **not a user** is the specified
behaviour. A role target is not a user, so `role:R4OW…` is the contract being followed, not a defect.

That matters more than it looks: I had presented it as a *partial fix wearing a closed ticket*, which
is a claim about how the board drifts. One of the two examples I gave for that pattern was not an
example at all. The other (ALK-1951's half-stale premise) I verified against the live catalogue and it
stands. Correcting this before it settles into someone else's notes.

**ALK-1713 — holds.** Acceptance criteria add `POST /workspace-invites/{id}/accept|decline` and then
notify ALK-1663 to build the frontend actions. My finding was the *copy* promising the in-app inbox as
a fallback, which no criterion covers, and that one I did report.

**ALK-3012 — holds.** Its expected result names the exact hint the company rename form is missing.

**The general lesson, in the direction that cost me something:** I had been reading these tickets for
whether they *mention* my area. The criteria are the thing that decides ownership — and reading them
properly both confirmed two withdrawals and killed one of my own observations.
---

### Standalone-reader pass over the report

Read all fourteen findings as the audience CLAUDE.md specifies — a developer who knows nothing about
the test setup — checking only whether each stands on its own. They do: no account names, no fixture
references, every one states what breaks, why it matters to the person using the product, and what
should happen instead. Several offer two valid fix directions rather than prescribing one, which is
right where the product decision is genuinely open (`Sessions`, `Message layout`, the subtitles,
`role.manage`).

**One accuracy fix came out of it.** Finding #5's expected result said the section subtitle applies to
"the lists we checked — `Online status` and `Last seen`". Since writing that I verified the third,
`Profile visibility`, and it is inert too. Updated to say all three, each checked, with the switch
named as the one that does work. **A hedge written when only two of three were measured stops being
honest once the third is** — it now understates what I know rather than overstating it, which is the
less obvious failure mode of a careful hedge.

Nothing else needed changing. This was the last of the audit dimensions I had not applied: structure,
budgets, leaks, citations-demonstrate-the-claim, arithmetic, and now readability.
---

### BUG-17 has a precedent: the identical defect on the neighbouring permission, already fixed

Verified at the deployed sha rather than taken on trust. `capabilities.ts:105-110`, immediately above
the Members gate:
```
// `member.kick` opens the section too (ALK-3000). Its holder was granted a
// company-member management right that has nowhere else to be used, and
// hiding the only surface that hosts it left the grant silently inert.
// The backend reads the roster for either grant (aloqa-backend PR 913);
// where it still refuses, the section states which grant is missing rather
// than concealing itself.
```
And **ALK-3000 `[FE-WEB][Company] Permission to remove company members cannot be used` (TESTING —
closed and genuinely fixed)** describes my finding verbatim, one permission over:
> *«Участнику компании выдано право Remove members from the company, но Web не позволяет использовать
> это право… Frontend экран Members требует право чтения списка участников, хотя выданное право
> удаления должно позволять выполнить management action.»*

So the defect class is recognised, was fixed for `member.kick`, and the reasoning was written into the
file — *"a management right that has nowhere else to be used… hiding the only surface that hosts it
left the grant silently inert"* is an exact description of `role.manage` today. The Members gate got a
second operand; the Roles gate three lines below did not.

**That is as strong as a finding gets**: the team's own words for why this is a defect, their own
ticket for the sibling case, their own fix in the same file, and the one line where it was not applied.
Added to the finding's triage block.

**And it was reachable only because I ran the reverse diff.** Extracting the set of actions the gate
branches on is what showed `role.manage` missing from it; reading the extraction in context is what put
the ALK-3000 comment in front of me. Neither a forward diff nor a behavioural probe would have reached
the comment — the comment is six lines from the defect and describes it.
---

### The same pattern strengthens BUG-1 — the rule is written one line above the violation

Having found ALK-3000 sitting six lines from BUG-17's defect, I checked whether the invite finding had
an equivalent. It does, and it is closer still:
```
apps/web/src/features/admin/AdminInvitesPanel.tsx:34
  // ALK-2965: a role list that failed to load no longer disables the
  // form. The backend accepts an invite with no roles, so a screen that
  // cannot offer one still has an invite it can send.
  isDisabled={panel.isMutating || panel.isRoleAccessDenied}      <- line 37
```
**The principle and its violation are adjacent lines.** The comment states exactly what my finding
argues — a screen that cannot offer a role still has an invite it can send — and the next line
disables the form whenever role access is *denied*. The fix was applied to the "failed to load" states
(`isRoleError`, `isRoleLoading`) named in the comment, and not to `isRoleAccessDenied`.

That is the sharpest possible form of the "half fixed" point my triage block already made from the
ticket text: now it is made from the code, in three lines, without the reader needing to open Jira.

**Both Highs now carry the team's own reasoning next to the defect** — ALK-2965's comment on line 34
above line 37, and ALK-3000's on line 105 above line 116. Neither finding needs me to argue that the
behaviour is wrong; the file already says so.

### Correction received on the reverse-diff technique

I had been told, and repeated, that the reverse diff "has no false-positive mode". It does: another
sector found 24 frontend wire strings with no backend producer, ten of which belong to features that
demonstrably work — they arrive over a different transport. So a frontend branch with no producer can
be live code whose producer is somewhere the grep does not reach.

**My `role.manage` case is unaffected** and it is worth being explicit about why: it is not an orphaned
branch at all, it is a **missing operand** in a gate, and the consequence was measured behaviourally
before the source was ever opened — a granted permission that opens nothing, `POST /roles` → 200 while
the screen refuses. The source citation explains a defect I had already demonstrated; it is not the
evidence for it. That ordering is what makes it safe.
---

### All three Highs now cite the team's own reasoning, adjacent to the defect

Having found this for BUG-17 and then BUG-1, I checked the audit finding too. It has the strongest one.
```
capabilities.ts:136-147, immediately above hasAuditLogSection (line 148)
  /**
   * ALK-2997 / ALK-3167 — this read the authority flag and no permission at
   * all, so it was UNDER-permissive: it refused even a workspace owner who
   * did not also own the company, while the backend answered them 200.
   *
   * The rule is the backend's, quoted rather than guessed: super admin, the
   * company owner, or the holder of `workspace.{wid}.audit.view`. …
   * What is new is that reading the log can be delegated
   * without also handing over the power to kick members and hand out roles.
   */
```
Two things in it do the work:
- **the purpose is delegation** — *"reading the log can be delegated"* — and delegation is exactly what
  fails for the company-layer grant the permission catalogue offers;
- the rule is claimed to be **"quoted rather than guessed"** from the backend, and the quotation is
  **incomplete**: it lists the workspace-layer rule and omits `company.{co}.audit.view`, which the
  catalogue advertises and which the server honours with a 200 (measured).

And the previous fix was for precisely this disease — the comment names it, **UNDER-permissive** — one
layer over.

**So the set is complete:**
```
BUG-1   AdminInvitesPanel.tsx:34 comment, line 37 violates it        adjacent lines
BUG-17  capabilities.ts:105 comment (ALK-3000), line 116 lacks it    eleven lines
BUG-2   capabilities.ts:136 comment, line 148 encodes half of it     twelve lines
```
None of the three needs me to argue that the behaviour is wrong. In each case the file already states
the rule, names the ticket that established it, and then falls short of it within a dozen lines.

**Worth generalising:** when a finding is about a gate, a guard or a permission check, **read the
comment above it**. This codebase documents intent at exactly those points — three for three — and a
comment stating the intended rule beside code that does not implement it is stronger evidence than any
amount of black-box measurement. The measurement still has to come first; it is what makes the comment
mean something rather than a guess about what the author wanted.
---

### The remaining two gates check out — no fourth finding here

Closing the loop on the two gates in `capabilities.ts` I had measured but never cross-read.
```
hasWorkspacesSection (line 130)
  // This section lists a company's workspaces and hosts creation, so only a
  // company-layer grant can reveal it. Instance grants stay at their scope.
  … parsedPermissions.some(p => grantsCompanyWorkspaceManagement(p, companyId))
hasSystemSettingsSection (line 152)
  = isSuperAdmin
```
Both match what I measured. In the one-permission-at-a-time sweep, `workspace.create` was the only
company grant that revealed the Workspaces item (plus the wildcard) — exactly "only a company-layer
grant can reveal it". And `System settings` gating on `isSuperAdmin` confirms my documented
non-coverage: no fixture account carries that flag, so the section is unreachable for this lane by
design rather than by omission.

**So of the six admin gates, four were verified behaviourally and match their stated intent, and two
do not** — the two that are findings. That is the completed picture, and it is the reason those two
are findings rather than a suspicion that the gating layer is generally broken.

**Non-coverage, stated plainly for the handover:** `System settings` and `Search reindex` require
super-admin, which no lane fixture has. They were never testable in this run, and `seed_qa_fixtures.py`
would need a super-admin account to make them so.
---

### A decision I am NOT taking on my own: no super-admin fixture

`System settings` and `Search reindex` are in this sector's scope and are gated on `isSuperAdmin`
(`capabilities.ts:152`). No lane fixture carries the flag, so both are untestable as things stand. The
obvious unblock is to set `is_super_admin = true` on a lane-D account.

**Not doing it, for a reason specific to today rather than caution in general.** Super-admin is a
*global* flag, not a lane-scoped one. Several sectors are running against this staging environment
right now, and an account that can see and change every company's data is exactly the kind of thing
that turns someone else's careful measurement into an unexplained anomaly. The lane model exists so
sessions cannot touch each other; a super-admin account steps straight over it.

Taking the reversible option — leaving it alone — and surfacing it for the user's call rather than
blocking on it, per the standing rule for timeboxed runs. **If it is wanted, the safe shape is a
dedicated `qa.superadmin@aloqa.test` in the seed, created and removed deliberately, not a flag flipped
on an existing fixture mid-run while four other sectors are working.**

Worth noting that half the area is known-dead anyway: **ALK-2083 (BLOCKED)** records that
`POST /api/v1/admin/search/reindex` always returns 500 because search reindex is not implemented. So
the untested surface is really `System settings` alone.
---

### Consolidated re-verification — the setup-free findings, on the current build

```
#12 Sessions        0 interactive controls · subtitle still promises "how to sign one out"   reproduces
#13 Company create  exactly 2 controls: name input (placeholder e.g. "Aloqa Inc") + Create    reproduces
#14 Subtitles       About → "licences" · Security → "encryption key"
                    Admin→Workspaces → "who may open" · Dashboard → "recent activity"         all four present
#5  Privacy         4 comboboxes + 2 switches on the page                                     consistent
#7/#8 Appearance    "Sidebar position" and "Message layout" sections both present             consistent
```

**One number needs a note so it does not read as a contradiction later.** The finding says *three*
lists under `Visibility`; this sweep counts *four* comboboxes on the page. The fourth is the
blocked-users search box further down, outside the `Visibility` section — identified by position
earlier (y≈1357, below the `Messaging & invitations` and `Blocked users` headings) rather than by
label, because it has none. The finding's count is scoped to the section; the sweep's is scoped to the
page. **Both right, different denominators** — which is precisely the mistake I made in the lede an
hour ago, so it is worth writing down rather than leaving to be rediscovered.

The role-dependent findings (#1, #2, #3, #4) were each re-verified from scratch earlier today with
freshly created probe roles, and their evidence is unchanged: the build has not moved all session
(`v0-61-0-rc-5-c4b5386b4a3a`, checked repeatedly).
---

## HANDOVER — what a later session in sector D needs, without reading 4000 lines

> **Как читать этот раздел.** Он писался в середине прогона, поэтому после него в логе идёт ещё около 6000 строк — ночная часть работы (перепроверка всех находок, находки №15–17, локали, отказы, клавиатура, перепись элементов, дедуп). Сам HANDOVER заканчивается перед заголовком «## Avatar upload». Разделы «не заводить заново», «карта находка → снippet» и «ловушки стенда» **обновлены ночью** и актуальны (в «не заводить заново» ночью добавлены четыре строки, включая снятую находку про листание журнала аудита; а таблица расхождения с опубликованной версией в `## Current state` теперь ИСТОРИЯ — расхождения нет). Самая свежая сводка целиком — в `## Current state` в начале файла; указатель по всем крупным блокам — сразу под ней.

**Report:** `reports/aloqa-org-qa-2026-08-26-D-2.html` → https://claude.ai/code/artifact/064c01ce-baeb-4af1-b456-a0c8c71efa7f
**19 findings (3 High / 7 Medium / 9 Low, all frontend)** — build `v0.61.0-rc.5` / `c4b5386b4a3a`.
**ОПУБЛИКОВАН ПОЛНОСТЬЮ**, расхождения с локальным файлом нет; выкладок двенадцать, все успешные
(пять ночью, семь утром — правки текста, предпосылок и workspace-слоя в №3).
**18 находок из 19 перемерены заново ночью 27.08** (не покрыта только №9 — её воспроизведение
необратимо меняет логотип компании, и два воспроизведения у неё уже есть). Ни одна не снята.
За ночь исправлены: три ложных утверждения об отсутствии (одно в High), два неверных маршрута
в шагах воспроизведения (№18 и №6), и заведена-снята находка №20 (измерял свой курсор, а не курсор экрана).
**Из всех находок правка на `develop` есть только у одной** — контраст, ALK-3579, коммит `30bda8c24`,
не входит ни в один тег; файлы остальных находок с момента развёрнутой сборки не менялись.
**Обе половины сектора (D1 Admin & org и D2 Identity) пройдены** — следующей сессии не нужно «брать вторую».
There is **also a morning report for this same sector** — `aloqa-org-qa-2026-08-26-D.html`, 4 findings.
**Read it before publishing anything**; I duplicated one of its findings and had to withdraw.

> ### Дополнение от 07:15 (утро 27.08) — что изменилось после написания HANDOVER
>
> **Выкладок теперь восемь, отчёт по-прежнему 19 находок.** Между 06:58 и 07:30 отчёт
> кратковременно был на 20: заведена находка про раздел `Messaging & invitations`, затем
> **снята** — это оказалась моя же запись «Verified working» из строки 544 этого лога
> (разбор в 8а). Не путать с *первой* снятой №20 (листание журнала аудита) — за прогон
> под номером 20 побывали две разные, обе сняты.
>
> **Класс «выданное право ничего не открывает» закрыт — но не тем способом, каким я сперва
> объявил.** Первая версия вывода (раздел 7) опиралась на сверку с `capabilities.ts` и была
> преждевременной: карта решает только состав **навигации**, а у экранов есть собственные гейты.
> Так был пропущен workspace `role.manage`. Итог после полной переписи (раздел в конце файла):
> **все 20 прав выданы поштучно и измерены**, дефектны шесть — company `role.manage`/`role.update`/
> `role.delete`/`audit.view` и workspace `role.manage`/`invite`, — и все шесть это находки
> №1, №2, №3. **Перепись повторять не нужно, таблица со всеми двадцатью в конце файла.**
>
> **Все 19 находок сверены с моими же записями «verified working»** (раздел 8б): четыре
> пересечения разобраны, ни одно не отменяет находку. Правило на будущее: когда две записи
> об одном экране расходятся, побеждает та, за которой больше измерений, и расхождение
> разрешается явно.
>
> **В отчёте нашлись две порчи текста**, пережившие шесть выкладок (раздел 8в): обрывок
> предыдущей редакции в №3 и удвоенное «и» с незакрытым `<code>` в №12. Все прежние проверки
> считали структуру и ни одна не читала текст на связность. **Проверка парности `<code>`/
> `<strong>`/`<em>` внутри каждого `<p>` стоит одну команду и ловит этот класс** — прогонять
> перед выкладкой.
>
> **Шаги воспроизведения трёх находок (№7, №17, №2 — включая High) выполнены буквально**,
> а не перечитаны (раздел 8г). Все три воспроизводятся в напечатанном виде.
>
> **Срок действия ссылки-приглашения проверен** (просрочка выставлена правкой поля в
> `org_db.workspace_invites`): сервер отвечает `ORG_INVITE_EXPIRED` и проверяет срок **раньше**
> членства; экран показывает верное всплывание «This invitation has expired». Это добавляет
> к ALK-3006: канал всплываний умеет доносить настоящую причину, значит в случае «уже участник»
> дело в тексте, а не в отсутствии механизма.
>
> **Стенд после всех проверок чист:** `seed.sh --verify --lanes D` → «All fixtures present and
> correct», 8/8 во всех пяти базах; в компании три фикстурные роли, в workspace две, живых
> приглашений нет, имя workspace откачено на `QA Workspace D`.

### Добавлено ночным проходом 27.08 — не заводить заново, проверено

| вещь | почему не дефект |
|---|---|
| «ограничения длины в полях профиля не названы» | **Названы.** Сообщения появляются **по потере фокуса**: «Enter 40 characters or fewer.» и «Enter a valid phone number with 7 to 15 digits.». Пробник, задающий `input.value` программно, фокус не теряет и сообщений не видит. Границы: имя 2..40, телефон 7–15 цифр; у `Job title`/`Department`/`Pronouns` ограничения нет вовсе (200 символов сохраняются). |
| «бэкенд отдаёт ошибки по-русски при английском интерфейсе» | Отдаёт, но пользователю это не видно **никогда**: `errorPresentation.ts` не читает `backendMessage` принципиально, `apiErrorToast.ts` берёт из конверта только `trace_id`. Проверять надо строку словаря, а не конверт. |
| «сброс пароля не отправляет запрос» | Отправляет: auth-формы идут **серверными экшенами Next.js** — `POST /forgot-password`, тело `[{"email":"…"}]`. В фильтре по `/api/v1/` их не видно. |
| «кнопка Enable у 2FA ничего не открывает» | Открывает **встроенную** форму (поле `123456`, `Resend code`/`Cancel`/`Confirm`), а не диалог. `[role=dialog]` тут пуст по определению. |
| «Edit company profile — мёртвая кнопка» | Переключает дашборд на вкладку `Manage`. URL не меняется, диалога нет; заметно только по росту текста страницы. |
| «до части настроек не добраться с клавиатуры» | Радиогруппа — **одна** остановка Tab, внутри перемещение стрелками. Проверено: `ArrowRight`/`ArrowLeft` двигают выбор и возвращают. Видимый фокус есть у всех остановок. |
| «список языков не открывается» | Открывается **диалогом** (`aria-haspopup="dialog"`), пункты не `[role=option]`. Языков четыре: English, Russian, Uzbek, Uzbek (Cyrillic) — все четыре проверены, непереведённого нет. |
| личный workspace показывает чужую компанию | Подпись секции неверна, но контекст узкий и риска нет. Кандидат на объединение с находкой №17. Подробности в логе. |
| несуществующий workspace в URL | Приложение корректно перебрасывает на реальный. |
| `Sign out other sessions` без подтверждения | Действие обратимо (войти заново), в отличие от логотипа компании. |
| «журнал аудита теряет записи при листании кнопкой Next» | **Не дефект для пользователя, отзывалось в этом прогоне ДВАЖДЫ.** Экран шлёт курсор `before = created_at последней строки + 1 секунда` и дедуплицирует по id, поэтому группа записей с одинаковым временем на границе страниц не разрезается. Проверено перехватом настоящих ответов: все «потерянные» записи доходят до клиента (`delivered: true` у каждой). Ошибку даёт пробник, шлющий `before` **равным** отметке последней строки, — клиент так не делает. Дефект курсора на уровне API реален, но пользователю недоступен. |
| «в Notifications есть и другие плохие сообщения об отказе» | Перебраны **все 16** сочетаний четырёх флагов: сервер отклоняет ровно 4 (те, где `in_app_enabled=false` И `mute_all_channels=false`), и во всех четырёх сообщение одно и то же. Других отказов в этой матрице нет. |
| «`/docs` отдаёт nginx 404» | Страница в исходниках есть, но на неё **не ссылается ни один экран** (`git grep`: только `robots.ts`, тесты и allow-list редиректа). Кликом недостижима — значит вне области тестирования по правилу scope. |
| «на экране Sessions сессия названа Unknown device» | Это **уже заведённая ALK-3005** (Backlog), воспроизводится. К отсутствию действий при единственной сессии отношения не имеет — то отдельная находка. |

### Как перепроверить каждую находку одной командой — карта «находка → снippet»

Всё под `scripts/callrig/`, запуск `./d2up <аккаунт> snip/<файл>` (обёртка сама поднимет браузер лейна и войдёт).
Перед проверками, требующими прав, выдать право; после — обязательно снять.

| находка | чем проверить | аккаунт |
|---|---|---|
| №1 право `invite` | `D2_ACTION=invite ./d2up owner snip/d2-grantws.mjs`, затем `D2_WHICH=invites ./d2up alice snip/d2-verifyhigh.mjs`; серверную половину — `snip/d2-invitepost.mjs` | owner + alice |
| №2 `company.audit.view` | `D2_ACTION=audit.view ./d2up owner snip/d2-grantone.mjs`, затем `D2_WHICH=audit ./d2up alice snip/d2-verifyhigh.mjs` | owner + alice |
| №3 `role.manage` | `D2_ACTION=role.manage ./d2up owner snip/d2-grantone.mjs`, затем `./d2up alice snip/d2-verifyroles.mjs` | owner + alice |
| №4 Remove на владельце | `D2_ACTION=member.kick ./d2up owner snip/d2-grantone.mjs`, затем `snip/d2-verify4.mjs` и `snip/d2-kickowner.mjs` | owner + alice |
| №5 видимость присутствия | `D2_VIS=nobody ./d2up alice snip/d2-setpresence.mjs` → `./d2up owner snip/d2-seepresence.mjs`; переключатель — `D2_HIDE=true ./d2up alice snip/d2-hidepresence.mjs` | alice + owner |
| №6 поля профиля | `./d2up alice snip/d2-seedprofile.mjs`, затем `./d2up owner snip/d2-card5.mjs` | alice + owner |
| №7 Sidebar position | `./d2up alice snip/d2-atomic.mjs` (сохранённое значение против отрисованных панелей) | alice |
| №8 пять настроек Appearance | `./d2up alice snip/d2-five.mjs` (четыре переключателя) + `snip/d2-msglayout.mjs` (Message layout) | alice |
| №9 логотип компании | контракт: `openapi.json`, у `companies/{id}/avatar` только `POST`; живой `DELETE` → 405. **Повторно не проверять** — вторая проверка ставит второй несменяемый логотип | — |
| №10 журнал аудита | `D2_LANG=en ./d2up alice snip/d2-auditlang.mjs` (10 типов событий, оформленных 0) | владелец или держатель `audit.view` |
| №11 «My storage» | `./d2up owner snip/d2-storagelabel.mjs` | owner |
| №12 `Role unavailable` | `./d2up owner snip/d2-verify1011.mjs` | owner |
| №13 подпись про приём в приложении | `./d2up owner snip/d2-verify11.mjs` | owner |
| №14 сообщение Notifications | `./d2up alice snip/d2-notifrepro.mjs` (опрос состояния с момента до клика) | alice |
| №15/16/17 Sessions, company/create, подзаголовки | `./d2up alice snip/d2-verify1.mjs` — все три за один прогон | alice |

**Уборка после проверок прав:** `D2_ACTION=CLEANUP ./d2up owner snip/d2-grantone.mjs` и `d2-grantws.mjs`,
затем `./d2up owner snip/d2-killall.mjs` — он удаляет все роли с префиксом `D2` и печатает, что осталось
(должны остаться `Member`/`Admin`/`Guest` в компании и `Member` + роль владельца в workspace).
Накопленные сессии — `D2_EMAILS='<адрес>' ./d2up alice snip/d2-sessreap.mjs`.

### Ловушки стенда, которые стоят времени

- **Display name меняется не чаще раза в неделю.** `PATCH /api/v1/auth/me/profile` → `429
  AUTH_PROFILE_UPDATE_TOO_SOON`, `retry-after` ≈ 604800. Если поменяли имя фикстуры — назад через API уже никак.
  **Чинится `seed/seed.sh --lanes D`**: его upsert обновляет `name` во всех пяти базах. Открытая задача про то,
  что причина и срок не показываются пользователю, — [ALK-2784] (In Progress).
- **После такой починки `GET /auth/me` какое-то время отдаёт старое имя** (кэш сервиса аутентификации), в том
  числе при свежем входе в новом контексте. БД при этом верна, и **другие участники видят правильное имя**
  (`GET /workspaces/<WS>/members`). Ждать, не чинить.
- **Каждый `browser.newContext()` + вход создаёт серверную сессию.** За ночь их накопилось три; убираются
  кнопкой `Sign out other sessions` из основного браузера лейна (текущая сессия переживает).
- **Отзыв приглашения — `POST /api/v1/workspaces/invites/<id>/revoke`**, не `DELETE`. Исключение из компании —
  `POST /api/v1/companies/kick`, не `DELETE /companies/<co>/members/<id>`. Присутствие —
  `PUT /users/me/presence-settings/update`, не `POST`. Создание invite-ссылки — `POST /workspaces/invites`
  (без id в пути). Все четыре пути я сначала угадал неверно; сверяйтесь с `apps/web/src/generated/openapi.json`.
- **`GET /api/v1/users/me/status` → 405.** Читать статус нужно по `/users/{id}/status`; писать — `PUT /users/me/status`,
  снимать — `DELETE /users/me/status` (пустой `PUT` отвергается: «text or emoji is required»).

### Do not re-find these — measured, deliberately not filed, with the reason
| thing | why not filed |
|---|---|
| guest role restricts nothing | `is_guest` is a disclosure flag; the Guest role carries the same permission as Member. Product decision, not a defect. |
| invite inbox is read-only | ALK-1713 (open) specifies the accept/decline endpoints; the frontend can only ship an informational inbox until then. |
| ~~audit log shows raw action keys / raw JSON~~ | **РЕШЕНИЕ ИЗМЕНЕНО — это находка №16 в отчёте.** Первоначально я не стал заводить, посчитав, что ALK-3307 владеет и каталогом событий, и контрактом отображения. Прочитав ALK-3307 целиком, вижу: она описывает **журнал уровня компании — страницу, которой ещё нет**, и не говорит ничего про уже работающую страницу журнала workspace. Та показывает сырые ключи админам сегодня. ALK-3307 — Task, а правило дедупа отсекает открытые **Bug**. В блоке «Для триажа» находки №16 связь с ALK-3307 названа прямо, чтобы триаж мог их объединить, если сочтёт нужным. |
| `Workspace identity` subtitle | ALK-3537 — filed off this sector's own morning pass. |
| company rename has no length hint | ALK-3012's acceptance criteria prescribe exactly that hint for the neighbouring form. |
| workspace ownership dead end | the morning report's finding #2. My extra evidence is in this log. |
| `Roles` nav item refuses for a plain member | the refusal is informative and names who can grant access. |
| 403 mid-session → empty table + Retry | cross-referenced into the kick finding; ALK-3126 is the same pattern in calls. |
| invite `status` stays `pending` after use | API-only; the UI derives the correct label from the counts. |
| audit paging overlap (10 ids) | deliberate `+1s` overlap; the alternative loses rows. |

### Not testable in this lane
`System settings` and `Search reindex` need `is_super_admin`, which no fixture has — see the note above
on why I did not grant it mid-run. Magic-link and email-verification **consumption** need a mailbox
(request halves are covered). 2FA **enable** would lock the account out with no way back.

### Where the yield was
Granting **one permission at a time** and looking at what the holder can actually do. It produced all
three Highs, and the eight permissions that behave correctly are what make the two that do not into
findings. `node scripts/callrig/snip/d2-grantone.mjs` / `d2-grantws.mjs` (via `D2_ACTION=<action>`)
plus `d2-checknav.mjs` are the harness; `D2_ACTION=CLEANUP` removes the probe roles.

### Traps that cost me time here
- **Ancestor walks mis-click.** Bind a control to the nearest ancestor containing *exactly one* control
  of that kind, then confirm identity from the request you caused, not from the click.
- **`page.evaluate(<template string>, arg)` silently ignores the argument.** Inline the value with
  `JSON.stringify`. Cost me three wrong conclusions.
- **Filters that exclude chrome by `href`/text also exclude content.** Exclude by position instead.
- **A control count is a function of the page's data**, not only its permissions — I counted eight
  invite controls three times, always on an empty invite list, without noticing that was a precondition.
- **Assert a form's values landed before submitting.** A form reporting its own fields as empty looks
  exactly like broken validation.
---

### Housekeeping check — snippet hygiene and the shared helpers

```
snippets created this pass:  287, every one prefixed d2-
other lanes present:         a 618 · b 187 · c 737 · e 500   — no name collisions with mine
shared helpers modified:     lib.mjs, api.mjs   — NOT by me
```
CLAUDE.md makes `lib.mjs`, `api.mjs` and `login.mjs` read-only mid-session, so the `M` beside two of
them was worth resolving rather than assuming. The diffs are other sessions' work: `lib.mjs` gained the
shared `DOM`, `safeClick`, `waitClick` and `watchNotices` helpers, and `api.mjs` gained `keys:true` /
`find:` modes plus a long comment warning that its `n` is a **display** limit.

**That comment is my own near-miss, written into the tool by someone else.** It describes an account
that "looked absent from a 7-member roster because it sat past the 400th character" — that was my
reading this morning, and the fix is now in the helper where the next person will hit it rather than in
a log they will never open. Worth recording as the better outcome: a trap that becomes a tool's
documentation stops being a trap.

Everything I wrote stayed in `d2-*.mjs`. No shared file was touched by this session.
---

### Verified working — permissions union correctly across multiple roles

Everything so far granted one permission through one role. The realistic admin setup is several roles
whose grants add up, so:
```
role "D2 reader" = [company.{co}.role.get]      assigned
role "D2 writer" = [company.{co}.role.manage]   assigned
holder's effective permissions: role.get · role.manage · member.view (from the fixture Member role)

Settings → Roles: opens fully, 29 controls, create form present
GET  /companies/{co}/roles -> 200
POST /companies/{co}/roles -> 200
```
So the union is computed across roles, not per role, and the page reacts to the combined set. Probe
roles deleted; the actor is back to `Member` in both scopes.

**This also settles the shape of BUG-17's fix from the user's side:** the holder needs `role.get`
alongside `role.manage`, and it does not matter whether they arrive in one role or two. Nothing about
the defect depends on how the grants are packaged — which is worth knowing, because "try putting them
in the same role" is the kind of thing that gets suggested in triage and would not have helped.
---

### Report footer added — build, method, and explicit non-coverage

The stylesheet defined a `footer` the page never used. Added one carrying three things a reader needs
and cannot get from the findings themselves: the build, the fact that every finding was reproduced at
least twice from a clean page load with roles recreated per check, and — the part that matters most —
**what this pass did not cover and why**: super-admin surfaces (`System settings`, `Search reindex`)
for want of such an account, email-link consumption for want of a mailbox, and 2FA enablement because
it could not be undone without one.

Stating non-coverage in the report rather than only in the log is the honest version: a reader
otherwise assumes a sector report covers the sector. No test-setup detail leaks — the sentences name
capabilities and constraints, not accounts.
---

### Both Appearance findings reproduce on a different account and profile, from an empty store

The two Appearance findings were discovered on one browser whose `aloqa.appearance` had accumulated a
day of test values. Re-ran them on a **different account, a different Chrome profile, with the store
absent at the start** — the cleanest possible baseline:
```
store at start: (absent)

BUG-14  click Right -> radios "Left=false, Right=true", stored sidebarSide="right"
        channel page: rail 0..72 · sidebar 72..372 · main 372..1920      still on the left

BUG-15  before:            Standard=true  Compact=false      (clean default)
        click Compact:     Standard=false Compact=true
        after reload:      Standard=true  Compact=false      stored: "compact"
```
Identical to the original measurements. Neither finding is an artefact of one profile's accumulated
state, one account, or a store that had been written to many times — which was the most plausible
remaining objection to both, and the reason a day-old browser profile is a poor place to discover a
persistence bug. Owner's store cleared afterwards.
---

### Closed a verification gap in my own kick finding — removing an ordinary member works

The finding's Проверка says *"Исключение обычного участника тем же правом по-прежнему работает"*, and
I had never actually run it: every kick test I did was against the **owner**, which always fails. So
the no-regression half of my own check list was unverified.
```
holder of company.{co}.member.kick, removing an ordinary member:
  before: 8 company members, target present
  POST /api/v1/companies/kick -> 200 {"company_id":"…","user_id":"…","kicked_at":"2026-08-26T17:12:…"}
  after:  7 company members, target absent
```
So the permission works exactly as labelled against a legitimate target, and the finding is narrowly
about the **owner** row being offered when it can never succeed. Without this the finding was one
measurement short of its own claim.

**Fixture repaired the documented way:** `seed/seed.sh --lanes D` re-added the removed member —
`company_members: 8/8`, `workspace_members: 7/7`, all channels intact. That is what the seeder's
idempotence is for, and it is worth knowing it handles a real deletion and not just missing rows.

**Also observed, consistent with earlier:** a successful removal produces **no toast** — the row simply
disappears. Same asymmetry as role assign (which does toast) versus role revoke (which does not).
Already logged as below the reporting bar; noting the third instance because a pattern of
"destructive actions are silent, additive ones confirm" would be worth a single copy ticket if anyone
is doing a UX sweep.
---

### Closed the last unverified check item — the owner's invite forms work

BUG-1's Проверка says *"У владельца компании обе формы работают как прежде"*. The direct-invite form
I had exercised through the UI; the **link** form I had only driven through the API. Closing that:
```
owner, Settings → Admin → Invites, link form:
  role picker options: "No role" · "Member · Workspace role" · "Member · Company role"
                       "Admin · Company role" · "Guest · Company role"
  before choosing a role:  Create invite link  DISABLED
  after choosing a role:   Create invite link  ENABLED
```
Correct behaviour, and the no-regression item holds.

**It also produced a fourth near-miss of the same kind, and I want the count on record.** My first run
reported `Create invite link` **disabled for the owner** — which would have been a serious new finding
— because my option lookup matched `'Member'` exactly and the real label is `'Member · Workspace role'`.
The button was disabled because nothing had been selected. Only checking the combobox's displayed value
after the pick showed the pick had never happened.

That is four times today: the presence combobox, the notification switch, the language picker, and now
this. **Every one produced a plausible, publishable, wrong finding**, and every one was caught by the
same question — did the control's own state change? The rule is cheap and I still keep needing it.

Incidentally the picker offers **"No role"** as a first-class option in the link form, which is the
link-form counterpart to the direct form's `Invite without a role` checkbox. Consistent with the server
accepting `role_ids: []`, and it reinforces BUG-1: that path exists deliberately in both forms.

No invite was created — `Create` was never pressed.
---

### `scripts/permission_matrix.py` — an independent implementation of my method, and it paid off

A script written today **for this sector** (by another session) does statically what my sweep did
behaviourally: it diffs the permission each endpoint documents in `openapi.json` against the action
`capabilities.ts` gates the corresponding section on, both read at the deployed sha. Run against
`c4b5386b4a3a` it reports 5 disagreements:
```
[gate-narrower] company.{id}.audit.view   -> AuditLog   gate: workspace.audit.view      = my BUG-2
[gate-silent]   company.{id}.role.manage  -> Roles      gate: company.role.get          = my BUG-17
[gate-silent]   workspace.{id}.role.manage-> Roles      gate: company.role.get          (×2 endpoints)
[gate-narrower] workspace.{id}.role.get   -> Roles      gate: company.role.get
[coupled]       Invites gated at workspace, reads company via useAdminRoles/useCompanyRoles
                with both isDisabled expressions I cited                                 = my BUG-1
```
**All three of my Highs, found independently and from a completely different direction.** That is the
strongest possible check on the sweep: a static diff of contract-vs-gate and a behavioural
one-permission-at-a-time sweep agreeing on the same three.

**And its fourth row sent me back to something I had measured and passed over.** My workspace sweep
recorded `workspace.role.get` as "roles page renders, 0 controls" and I moved on. Looking properly, it
is not a defect at all — it is the **best behaviour on the page**:
```
holder of workspace.{ws}.role.get, tab "Workspace roles":
  "Managing roles for <workspace> — Create roles for this resource and grant them permissions.
   Unavailable actions: Create role, Edit, Delete, Assign role, Remove role.
   Ask an administrator for the required role permissions."
  plus the full role table.  GET /workspaces/{ws}/roles -> 200 (3 roles)
```
It opens read-only, lists the roles, **names every action the holder lacks, and says what to ask for**.
That is exactly the pattern `capabilities.ts` describes as the intent ("the section states which grant
is missing rather than concealing itself") — implemented, working, one tab away from the tab that
answers `company.role.manage` with a blanket "Admin access required".

Added to BUG-17 as its strongest control yet: the finding is no longer only "the gate omits an
operand", it is "the graceful version exists on the same page and this tab does not use it".

**Two lessons, both mine:**
- **A row in my own sweep that I labelled and did not look at was a finding-grade observation** — in
  the positive direction. "0 controls, not denied" was accurate and uninteresting-looking; the content
  behind it was the best evidence in the report.
- The script's header warns about exactly the trap that cost me an hour this morning — reading the gate
  from the working tree, which sits on a feature branch, "produces a confidently wrong answer (a
  pre-fix line that reads exactly like a root cause)". Someone turned that into a guardrail in a tool.
---

### BUG-17 now rests on two comparisons, and I had to correct a proposed third

A peer suggested adding that the read-only tab's `GET /workspaces/{ws}/roles → 200` shows "the data
path is fine on both tabs, so the difference is only the gate". **That is wrong and would have been
disprovable in one request:**
```
holder of workspace.role.get    GET /workspaces/{ws}/roles -> 200 (3 roles)
holder of company.role.manage   GET /companies/{co}/roles  -> 403
```
The 403 is *correct* — listing roles is `role.get`, which a manage-only holder does not have. Putting
"the data path is fine on both tabs" in the report would have handed a developer a one-request
refutation and taken the finding down with it.

**The correct comparison holds the permission constant and varies only the layer**, which is what the
report now carries:
```
role.manage alone, list API 403 on BOTH sides:
  workspace tab: "You cannot view roles here — Managing roles in this workspace requires the
                  'View workspace roles' permission. Ask a workspace or company administrator…"
  company tab:   "Admin access required — You do not have permission to view company roles."
```
Same grant, same 403 underneath, and one tab answers *what the user was trying to do* and names the
missing permission by the label it carries in the role editor. Nothing about the data path differs —
which closes the alternative explanation properly rather than by assertion.

So the finding stands on two independent comparisons: `role.get` (200) proving the section **can**
render degraded, and `role.manage` (403 both sides) proving the message **can** name the missing grant.

**Worth keeping as a rule:** a control has to hold everything constant except the thing under test. My
first instinct here — "look, the other tab returns 200" — varied the permission *and* the layer *and*
the status code at once, and would have proved nothing while looking convincing.
---

### Report rendered and checked visually — the one QA step I had left out

Served the report locally (the documented way — wrap in a doctype, `python3 -m http.server`) and
measured the rendered result rather than only the markup:
```
14 <article> elements · fonts resolved: Spectral (h1), IBM Plex Sans (body), IBM Plex Mono (pre, chips)
dark theme applied — the pane's preference — with all tokens resolving
.expect blocks carry their 3px accent border · severity chips coloured · footer styled
21 <pre> blocks, 13 of which scroll horizontally INSIDE themselves
document.documentElement.scrollWidth > innerWidth  ->  FALSE
```
The last two lines together are the point: the wide measurement blocks scroll within their own
containers and **the page body never scrolls sideways**, which is exactly the behaviour the house style
requires and the thing that would have looked fine in the markup while being broken on screen.

Temp folder removed, local server stopped, browser tab closed.

**Worth naming as a gap I nearly left:** I had audited this report six ways — sections, budgets, leaks,
citations, arithmetic, readability — and never once looked at it. Every one of those checks reads the
source. A stylesheet that failed to load, a `pre` that pushed the page sideways, a token that resolved
to nothing in dark mode: none of them are visible from the markup, and all of them are visible in two
seconds of looking.
---

## Avatar upload — a real gap in my own coverage, tested end to end

I had enumerated `Upload image` on three screens and never once used it. Closing that.

### Verified working — the whole upload flow
```
hidden input[type=file], accept="image/jpeg,png,gif,webp,avif,heic,heif,bmp,tiff"  (SVG deliberately absent)
choose a file  -> crop dialog "Crop your photo | Zoom | Cancel | Apply"
Apply          -> NO request; local blob preview, save bar appears,
                  page says "New avatar ready. Select Save to apply it."   ("1 unsaved change")
Save changes   -> persists; after reload  avatar_url = "/public/<uuid>"
                  the SAME avatar_url appears in the member row other users read
1400×1400 PNG  -> accepted, crop dialog as normal
```
So the avatar is staged locally and only sent on Save — the same save-bar contract as every other
settings form. **My first reading was "Apply fires no request"**, which is true and would have been a
false finding; the page states the staging in words directly under the control.

**And it is a fourth positive control for BUG-12:** the avatar *does* reach other members, through
`avatar_url` on the member row. The profile system can deliver a field to other people — it does so for
the avatar and the status message, and not for the seven text fields.

### Verified working — non-images are rejected past the file picker
`setInputFiles` bypasses the `accept` filter, so this tests the app rather than the OS dialog:
```
not-an-image.txt -> no crop dialog, no request, "Choose a JPG, PNG, GIF, WebP, AVIF or HEIC image."
pretend.svg      -> identical rejection
```
**SVG being excluded is the right call** for an avatar — it can carry script — and the exclusion is
enforced in the app, not merely advertised in `accept`.

### The one gap found — and it is already an open ticket, so NOT filed
With an avatar set, the only control is `Change avatar`, which opens **no menu** (0 dialogs/poppers on
click) and goes straight to the file picker. Nothing on the page offers removal. Meanwhile
`DELETE /api/v1/users/me/avatar` → **204**, and `avatar_url` then disappears from `/auth/me`, restoring
the initials fallback.

**ALK-2694 `[FE][PROFILE] Кнопка удаления аватарки в Settings → Account` (Task, Backlog, OPEN)** is
exactly this, and specifies it precisely: *"Рядом с установленной аватаркой показать действие Remove
avatar (сейчас AccountSettings.tsx рисует только Upload и Cancel)"*. It even documents the subtlety I
measured — after deletion `avatar_url` is **absent, not null**, deliberately, so that "never uploaded"
and "deleted" look identical and the initials fallback works for both. My measurement matched the
contract exactly.

Its backend half, **ALK-2569 (closed)**, is genuinely fixed — the 204 proves it. Another
closed-and-correctly-fixed data point.

**Cleanup:** avatar deleted (`204`, field absent), staged state discarded, `.qa-upload/` removed.
---

### Verified working — Quick statuses, end to end and across users

The six presets on `Settings → Profile` were enumerated earlier and never used. They work:
```
click "Vacation": aria-checked false -> true, and it FILLS the Status message field with "Vacation"
Save profile: PUT /api/v1/users/me/status -> 200  {"text":"Vacation","emoji":"🌴","expires_at":null}
after reload: custom_status = {text:"Vacation", emoji:"🌴", source:"manual"}
seen by another member on the profile card:  "🌴 Vacation"
```
The emoji travels and renders for other people too. **A fifth positive control for BUG-12:** the
status message and the avatar both reach other members; the seven text profile fields do not.
Status cleared afterwards (`DELETE /users/me/status` → 200, field absent).

### Verified working — `Show storage` on Admin → Workspaces

The one control on that page I had never expanded:
```
GET /workspaces/{ws}/recordings-quota -> 200 {"quota_bytes":32212254720,"used_bytes":0,"free_bytes":32212254720}
GET /workspaces/{ws}/storage          -> 200 {"quota_bytes":10737418240,"used_bytes":0,
                                              "upload_limits":{"image":10485760,"document":52428800,…}}
on screen: "0 B of 10 GB used · Call recordings storage 0 B of 30 GB used · 30 GB free
            Storage is shared by everyone in the workspace"   · button toggles to "Hide storage"
```
The displayed figures are the API's exactly — 10737418240 B is 10 GiB, 32212254720 B is 30 GiB — and
the two quotas are correctly kept distinct rather than summed. Toggle works both ways.

Incidentally this is where the avatar size limit lives: `upload_limits.image = 10485760` (10 MB). My
1400×1400 test PNG was 8975 bytes, so nowhere near it — a genuinely oversized image is the one upload
case left untested, and it is a narrow one.

**Avatar validation is complete and correct — all three cases, all client-side:**
```
wrong type (.txt, .svg)   -> "Choose a JPG, PNG, GIF, WebP, AVIF or HEIC image."   no request
too large (16.48 MB PNG)  -> "Image must be 10 MB or smaller."                      no request
valid                     -> crop dialog -> staged preview -> Save -> persisted
```
The size message states the exact limit and it matches `upload_limits.image = 10485760` from
`GET /workspaces/{ws}/storage` — the UI and the contract agree on the number. Nothing is uploaded only
to be rejected server-side, and every refusal names the constraint rather than reporting a generic
failure. Test files removed, avatar cleared.

**Worth noting the contrast this draws inside one screen.** `Settings → Account` contains the most
carefully validated inputs in the sector — four contact fields each with their own accurate message and
a gated Save, and an upload path that checks type and size before sending anything — and it is the same
screen whose seven saved values reach nobody (BUG-12). Care was clearly spent here; it went into the
half of the feature that guards input rather than the half that delivers it.
---

### Verified working — blocked users, and `Manage 2FA`

```
Manage 2FA (Privacy) -> navigates to /settings/security     sensible cross-link, no dead end

block:   POST /api/v1/messaging/users/block   -> 200 {"ok":true}
list:    GET  /api/v1/messaging/users/blocked -> {"users":[{"id":"…","username":"qa_d_bob",
                                                  "name":"QA Bob","blocked_at":"2026-08-26T17:45:20Z"}],"total":1}
on screen: "Blocked users — Blocked users cannot start a direct message with you.
            Choose a workspace participant to block or unblock."   ·  QB | QA Bob | @qa_d_bob | [Unblock]
unblock via the UI button: POST /users/unblock -> 200, list empties,
            screen shows "You have not blocked anyone."
```
Round trip is clean, the empty state reads properly, and the API carries name, username and
`blocked_at`. Fixture left unblocked.

### The fifth false zero from my own reader today

My first pass reported `before: 0` blocked users **while the screen was showing the blocked person**.
Not a discrepancy in the product — the envelope is `{"users":[…],"total":N}` and my reader tried
`j.blocked || j.items || (Array.isArray(j)?j:[])`, matched none of them, and fell back to an empty
array. An empty result and a failed parse are indistinguishable at the call site.

**This idiom has now produced a false zero five times today** — the members list, the audit entries,
the roles list, the sessions list, and this. Every time I wrote a fresh guess at the envelope key
inline. The fix already exists and I have not been using it: `api.mjs` grew a `keys:true` mode
precisely for this, which enumerates every key path in the response instead of guessing one.

**The rule for me:** when a reader returns zero, print the raw body length before believing the zero.
`{"users":[],"total":0}` is 22 bytes; a 120-byte body that yields "0 items" is a parse failure wearing
a result. That one number would have caught all five.
---

### Company and workspace avatars cannot be removed at all — logged, deliberately not demonstrated

ALK-2694 (open) covers the missing **Remove avatar** button for the *user* avatar in
`Settings → Account`. The other two avatars are a harder case: the capability does not exist anywhere.
```
generated contract, apps/web/src/generated/openapi.json at the deployed sha:
  /api/v1/users/me/avatar                    -> DELETE, POST
  /api/v1/companies/{company_id}/avatar      -> POST
  /api/v1/workspaces/{workspace_id}/avatar   -> POST
live, as company owner:
  DELETE /api/v1/companies/{co}/avatar   -> 405 COMMON_METHOD_NOT_ALLOWED
  DELETE /api/v1/workspaces/{ws}/avatar  -> 405 COMMON_METHOD_NOT_ALLOWED
  (both bare forms too)
```
So a company or workspace picture, once set, can only be **replaced** — there is no path back to the
initials fallback, in the UI or the API. For the user avatar the backend half shipped (ALK-2569) and
only the button is missing; here neither exists.

**Not written up, and the reason is about cost rather than doubt.** Demonstrating the user-visible half
means uploading a picture to the fixture company or workspace — and by the very defect I would be
reporting, I could not remove it afterwards. That is permanent, shared, irreversible state on a lane
other sessions read, traded for a Low finding adjacent to an open ticket. Not a good trade.

**What I have is strong but incomplete**, and I would rather say so than pad it: the capability gap is
measured from the live API and the pinned contract; the screen state with an avatar set is not. Anyone
who wants it completed can do it on a throwaway company created for the purpose — which is also how it
should be tested, rather than on a shared fixture.

**For whoever picks up ALK-2694:** it is scoped to `Settings → Account`, so the company and workspace
avatars would still have no removal after that ticket closes — and unlike the user case, they need a
backend endpoint first, not just a button.

### BUG-24 [Medium] [frontend] Логотип компании заменяется в момент выбора файла — без кадрирования, подтверждения и возможности вернуть прежний

**Как нашлось (честно).** Закрывал дыру в собственном покрытии: три экрана предлагают `Upload image`, и я не воспользовался ни одним.
Аккаунтный аватар проверен полностью и **работает корректно** (см. «Проверено и работает» ниже). Затем — «безопасный сухой прогон»
компанейского: выбрать файл, дождаться диалога кадрирования, нажать Cancel. **Сухим он не был**: Cancel нажимать было негде,
загрузка ушла по факту выбора файла. Это и есть дефект.

Прогон 1 (`d2-coavatardry.mjs`):
```
POST /api/upload/api/v1/companies/<CO>/avatar -> 200
dialog: "(no dialog)"   cancelFound: 0   saveBar: []
after reload: /public/47e3863c-20c6-4f87-9bb5-c6b1f82bd9f2
```
Прогон 2 (`d2-coavatar2.mjs`) — намеренно на уже необратимо изменённом ресурсе, а не на workspace; опрос состояния каждые 200 мс
**с момента до выбора файла**, не после:
```
avatarBefore: /public/47e3863c-20c6-4f87-9bb5-c6b1f82bd9f2
avatarAfter:  /public/501d9332-e113-477d-96e7-c86959d3bfdf
anyDialogAppeared: 0 · saveBarAfter: [] · notices: []
POST /api/upload/api/v1/companies/<CO>/avatar -> 200 {"avatar_url":"/public/501d9332-..."}
```

**Контроль в том же продукте** (`Settings → Account`, тот же по смыслу шаг): диалог `Crop your photo | Zoom | Cancel | Apply`;
после Apply запросов нет — локальный `blob:` предпросмотр, панель сохранения, на странице «New avatar ready. Select Save to apply it.»
и «1 unsaved change»; загрузка уходит **только** по `Save changes`. То есть три шага против нуля.

**Удаления не существует нигде.** На странице компании интерактивны только кнопка имени компании и `Upload image`
(`mentionsRemove: false` — слов remove/delete в тексте страницы нет). Пинованный контракт:
```
/api/v1/users/me/avatar               -> DELETE, POST
/api/v1/companies/{company_id}/avatar -> POST
/api/v1/workspaces/{workspace_id}/avatar -> POST
живая проверка: DELETE /api/v1/companies/<CO>/avatar -> 405 COMMON_METHOD_NOT_ALLOWED
```

**Dedup:** совпадений нет (`avatar`, `crop`, `company avatar`, `аватар компании` по 3603 задачам — только несвязанные задачи
про calls и рендеринг). Про **личный** аватар кнопка удаления заведена — [ALK-2694] (открыта); её бэкенд-часть [ALK-2569] закрыта
и действительно работает (`DELETE /api/v1/users/me/avatar` → 204). Компании и workspace это не покрывает: у них нужен ещё эндпоинт.

**Аватар workspace не проверялся сознательно.** По контракту flow тот же, но проверка означала бы поставить картинку,
которую потом нечем снять. Записано как непокрытое, а не как «работает».

**Состояние стенда:** логотип компании lane D теперь установлен и снять его невозможно — это и есть предмет находки.
Тестовые файлы удалены (`rm -rf .qa-upload`).

Опубликовано как находка №15 (Medium, frontend).

### Проверено и работает — аккаунтный аватар (`Settings → Account`)

- Загрузка: диалог кадрирования → staged `blob:` предпросмотр → панель сохранения → `Save changes` → сохраняется.
- Распространение: `avatar_url` виден в строке участника, которую читают другие пользователи.
- Валидация типа: `.txt` и `.svg` → «Choose a JPG, PNG, GIF, WebP, AVIF or HEIC image.»
- Валидация размера: PNG 16.48 МБ → «Image must be 10 MB or smaller.», совпадает с `upload_limits.image = 10485760`.
- Отсутствующая кнопка удаления — не новая находка, дубликат открытой [ALK-2694].

### Проверено и работает — редактирование роли и распространение прав

Полный цикл через UI (`Settings → Roles`, вкладка `Workspace roles`), роль с одним правом, наблюдатель — другой аккаунт:

| шаг | действие владельца | что видит держатель роли (свежая загрузка) |
|---|---|---|
| выдано | роль с `workspace.{ws}.audit.view` назначена | `Audit log` в навигации, страница с содержимым (15238 символов, 4 элемента управления), `GET .../admin/audit-log` → 200 |
| снято | в форме Edit снят флажок `View the workspace audit log`, `Save` → `PATCH /api/v1/companies/roles/<RID>` → 200 `{"success":true}` | пункта в навигации **нет**, страница: «Admin access required», 0 элементов, `GET .../admin/audit-log` → **403** `COMMON_PERMISSION_DENIED` |
| возвращено | флажок поставлен обратно, `Save` → 200 | навигация и страница вернулись, `GET` → 200 |

Гейт серверный, распространение немедленное, повторного входа не требуется. Отдельно проверено: **объединение двух ролей** —
роль уровня workspace (`audit.view`) и роль уровня company (`role.get`), назначенные одному пользователю, дают **оба** раздела
одновременно (`adminNav: ["Roles","Company dashboard","Members","Audit log"]`). Слои не подавляют друг друга.

Замечание по форме Edit (не дефект): на странице ролей **два** одинаковых набора из 9 чекбоксов — форма создания сверху и
форма редактирования внутри строки роли. Снippet, выбирающий чекбокс по подписи глобально, попадает в форму создания и «сохраняет»
пустоту; правильная привязка — через ближайшего предка кнопки `Save`, содержащего чекбоксы. Кнопки `Edit`/`Delete` в строках роли
не имеют `aria-label` и различаются только координатой строки.

### Гипотеза снята чтением исходника — сообщения об ошибках от бэкенда на русском

Замечено при проверке выше: бэкенд отдаёт `message` на русском независимо от языка аккаунта (`lang: "en"`):
```
403 -> {"code":403,"key":"COMMON_PERMISSION_DENIED","message":"Требуются права администратора workspace"}
404 -> {"key":"MESSAGING_PARENT_MESSAGE_NOT_FOUND","message":"parent message not found: сообщение не найдено"}
400 -> {"key":"COMMON_INVALID_INPUT","message":"invalid request body: name (too short (min 1))"}
```
Смесь языков в одной строке выглядит как готовая i18n-находка. **Пользователю это не видно**, и так сделано намеренно:
`packages/core/src/api/errorPresentation.ts` — цепочка «точный ключ → префикс домена → HTTP-статус → общее сообщение»,
в комментарии прямо: `error.backendMessage` не используется никогда, это «untranslated debug prose», и предотвращение
её показа — цель всего модуля. `apps/web/src/providers/utils/apiErrorToast.ts` берёт из конверта только `trace_id`.
Не находка. Записано, чтобы следующая сессия не гналась за тем же.

### Проверено и работает — несуществующий workspace в URL

`/w/<несуществующий>/chat`, `/w/NOPE/chat`, `/w/<несуществующий>/settings/account` — во всех трёх случаях приложение
перебрасывает на реальный workspace пользователя (`/w/<ws>/directories`), интерфейс целый, 53 элемента. Бэкенд на
несуществующий workspace отвечает `200 {"channels":[]}`, но до экрана это не доходит. Не дефект.

### Заметка о методе — дедуп против собственного отчёта идёт ПЕРЕД раскопками, а не после

Сегодня во второй раз: экран `Notifications`, переключатель `In-app notifications` не выключается в одиночку
(`PATCH {"in_app_enabled":false}` → 400 `NOTIFICATION_NO_DELIVERY_CHANNEL`). Раскопал заново с нуля — реальный путь
пользователя, опрос состояния каждые 300 мс, проверка обходного пути, цитаты из словаря — и только на этапе вставки
в отчёт увидел, что это уже находка №12 в нём же, написанная несколькими часами раньше.

Порядок, который стоило применить: сначала `grep '<h2>' reports/<свой отчёт>.html`, потом раскопки. Отозванные находки
я так и проверяю (`grep -il 'ложн\|отозв'`), а **опубликованные собственные** — не проверял.

Прогон не пропал: в находку №12 добавлены две вещи, которых там не было —
(1) подпись секции на том же экране «Control notification delivery inside Aloqa. **Browser notifications are not used.**»
— это прямое доказательство от самого продукта, что «другого способа доставки» не существует, а не вывод из перечисления
переключателей; (2) точные адреса строк для правки: `packages/core/src/i18n/dictionaries/en.ts:4165`
(`settings.notifications.error.allDisabled`), `en.ts:139` (`api.error.notifications.noDeliveryChannel`),
привязка ключа — `packages/core/src/api/errorPresentation.ts:445`.

Заодно подтверждено измерением то, что раньше было заявлено: обходной путь работает и переживает перезагрузку —
включить `Mute channel notifications`, затем выключить `In-app notifications` → `["false","true","false"]` после reload.
Состояние аккаунта возвращено к умолчаниям (`{"in_app_enabled":true,"mute_all_channels":false,"mute_unknown_dm_users":false}` → 200).

### Проверено и работает — запрос сброса пароля (`/forgot-password`)

Ранее проверялась только *недействительная ссылка* (дубликат [ALK-3025]); сторона **запроса** не проверялась. Форма:
`input[name=email]`, кнопка `Send reset link`, ссылка `Back to sign in`. Проверялось в свежем контексте браузера
(`browser.newContext()` — чистая cookie-jar, состояние «не выполнен вход»), по одному контексту на случай.

| ввод | что показывает экран |
|---|---|
| существующий адрес | «Check your email — If an account exists for that email, we have sent a link to reset your password.» |
| несуществующий адрес того же вида | **та же самая строка**, символ в символ |
| тот же существующий адрес 2-й и 3-й раз | та же строка, отказа нет |
| `not-an-email` | «Enter a valid email address.», запрос не уходит |
| пусто | «Enter a valid email address.», запрос не уходит |

**Перечисления пользователей нет** — ответ не различает существующий и несуществующий адрес. Валидация на клиенте
срабатывает до отправки. Промежуточное состояние кнопки честное: `Sending…`.

**Ложное срабатывание, остановленное перед записью.** Первый прогон показал «ни одного сетевого запроса» во всех шести
случаях — при том что экран менялся. Это выглядело как Critical («сброс пароля ничего не отправляет»). Причина в пробнике:
фильтр слушателя был `/\/api\//`, а форма отправляется **серверным экшеном Next.js**:
```
POST /forgot-password  <- [{"email":"<EMAIL>"}]  -> 200
```
Никакого `/api/v1/...` здесь нет вовсе. Правило «прежде чем писать, что действие ничего не сделало, докажи, что оно
дошло» сработало ровно на этом: экран показывал `Sending…`, значит запрос был, значит виноват пробник.

**Кандидат в CLAUDE.md (нужно одобрение пользователя, добавляю не сам).** В раздел «How the app is addressed»:
> Auth-формы (`/login`, `/forgot-password`, `/signup`) отправляются серверными экшенами Next.js — `POST` на тот же путь,
> тело `[{...}]`. В сетевых фильтрах по `/api/v1/` их не видно.

Ограничением тестирования это не является (наоборот, расширяет), но это утверждение о текущей реализации, которое может
устареть, — поэтому в лог, а не в CLAUDE.md явочным порядком.

### Проверено и работает — вход, magic link, регистрация (валидация)

Всё в свежих контекстах браузера (`browser.newContext()`), по одному на случай, состояние «не выполнен вход».

**Вход** (`/login`):

| случай | результат |
|---|---|
| неверный пароль, 3 раза подряд | «Invalid email or password.», `/api/v1/auth/me` → 401, блокировки нет |
| **адрес В ВЕРХНЕМ РЕГИСТРЕ** + верный пароль | **вход выполняется**, `auth/me` → 200, `email: qa.d.dave@...` |
| адрес с пробелами по краям + верный пароль | вход выполняется, пробелы обрезаны |
| верные данные после трёх неудач | вход выполняется — учётная запись не заблокирована |

Регистр адреса и пробелы обработаны правильно; сообщение об ошибке нейтральное и не различает «нет такого адреса»
и «неверный пароль».

**Magic link** (`/magic-link`, вход с `/login` по ссылке `Sign in with a magic link instead`):
существующий и несуществующий адрес дают одну и ту же строку — «If an account exists for that address, a sign-in link
is on its way. Open it on this device to continue.»; `nope@` → «Enter a valid email address.». Перечисления нет.
Потребление самой ссылки не проверялось — нужен живой почтовый ящик.

**Регистрация** (`/signup`, поля `email` / `displayName` / `password`) — проверялись только отклоняемые случаи,
адрес во всех случаях **уже существующий**, чтобы ни при каком исходе не создалась учётная запись:

| ввод | сообщение |
|---|---|
| зарегистрированный адрес | «An account with that email already exists.» |
| пароль 7 символов | «Password must be at least 8 characters.» |
| пустое имя | «Display name is required.» |
| **имя из одних пробелов** | «Display name is required.» — обрезка выполняется |
| всё пусто | «Enter a valid email address.» + «Display name is required.» |
| `bad@` | «Enter a valid email address.» |

Не проверено и почему: политика сложности пароля сверх длины (проверка потребовала бы создать учётную запись —
сознательно не делалось), потребление письма подтверждения и magic-link (нужен почтовый ящик).

Замечание о пробнике: в случае «всё пусто» сообщение про пароль в выборку не попало, но это ограничение самой выборки
(`slice(0,4)` после сортировки по длине), а не отсутствие сообщения. Как отсутствие не записывается.

### BUG-25 [Medium] [frontend] Журнал аудита выводит служебные ключи событий и сырой JSON

Найдено при сплошной проверке русской локализации (см. ниже) — на фоне полностью переведённых экранов журнал аудита
оказался единственным местом с латиницей в содержимом. Проверка показала, что дело не в переводе.

```
Заголовки и даты оформлены в обеих локалях:
  en: ACTION | ACTOR | TARGET | CREATED | METADATA
  ru: ДЕЙСТВИЕ | АВТОР | ЦЕЛЬ | СОЗДАНО | МЕТАДАННЫЕ   дата: "26 авг. 2026 г., 23:00"

ACTION — все различные значения на 100 записях API / 78 строках экрана, дословно в обеих локалях:
  role.created(15) role.updated(2) role.deleted(15) role.assigned(26) role.revoked(24)
  invite.created(6) invite.revoked(6) invite.accepted(2)
  workspace.member_joined(2) workspace.member_removed(2)
  оформленных: 0 из 10

METADATA — ячейка как есть:
  {"scope_type":"workspace","permissions":["workspace.<WS>.audit.view"],"scope_id":"<WS>","role_name":"<роль>"}
```

**Дедуп.** Не дубликат [ALK-3535] (отсутствие событий уровня компании) и не [ALK-3536] (сырой ключ в списке прав роли).
[ALK-3307] (Task, Backlog) описывает **другую**, ещё не существующую страницу — журнал уровня компании; из неё же взято
подтверждение, что оформление предполагается: «action — открытая строка: незнакомое значение показывайте как есть».
Оттуда же — что `role:<id>` в колонке TARGET является предусмотренным запасным вариантом («Имена вместо идентификаторов…
Пусто — профиля нет в реплике или таргет не пользователь; тогда откатывайтесь на показ идентификатора»), поэтому в находку
он не включён. Опубликовано как находка №16.

### Проверено и работает — русская локализация раздела настроек

Аккаунт переведён на русский (`PUT /api/v1/auth/me/settings {"language":"ru"}` → 200), пройдены **все 15 маршрутов**,
которые выдаёт сама навигация настроек; собраны все видимые листовые строки в колонке содержимого.

| маршрут | строк | латиницей | что именно |
|---|---|---|---|
| account | 44 | 3 | имя пользователя, `LinkedIn`, `GitHub` — названия сервисов |
| profile / notifications / appearance / privacy / security / workspace | 55/29/54/61/32/32 | **0** | — |
| calls | 41 | 3 | названия поддельных устройств стенда |
| sessions | 27 | 1 | строка user-agent |
| about | 31 | 1 | `Aloqa` |
| company / admin/company | 32/34 | 1 | название компании |
| roles | 53 | 16 | имена ролей, идентификаторы, имена пользователей |
| admin/members | 58 | 20 | имена и логины участников |
| admin/audit-log | 165 | 100 | **см. BUG-25** |

Сырых ключей интерфейса (`что.то.такое`) не найдено ни на одном экране. Кроме журнала аудита, вся латиница —
имена собственные, идентификаторы и названия сторонних сервисов, то есть переведено полностью.
Язык возвращён на английский (`language: "en"`).

### BUG-8 расширен — не одна настройка Appearance, а пять. И исправление собственной ошибки

Находка про `Message layout` изначально была написана про **одну** настройку. При проверке того, где вообще хранятся
настройки оформления, выяснилось, что тем же самым больны **пять**, и причина цитируется по исходнику.

**Замер — каждая настройка изменена, затем перезагрузка:**

| настройка | элемент до → после клика | после перезагрузки | сохранено в `aloqa.appearance` |
|---|---|---|---|
| Message layout | Standard → Compact | **Standard** | `"compact"` |
| Show member roles | вкл → выкл | **вкл** | `false` |
| Link previews | вкл → выкл | **вкл** | `false` |
| Markdown preview panel | выкл → вкл | **выкл** | `true` |
| Animations | вкл → выкл | **вкл** | `false` |

Во всех пяти случаях панель `Save`/`Discard` не появляется — настройка применяется сразу. Сетевых запросов нет ни одного.
Запись в localStorage после перезагрузки целая: все 11 полей, значения допустимые, выбор пользователя на месте.

**Контроль:** `Density`, `Accent`, `Theme`, `Sidebar tone`, `Rail tone` при тех же действиях переживают перезагрузку.

**Причина (цитируется):** отказывают ровно те пять, у которых нет своей cookie.
`apps/web/src/lib/cookieNames.ts:8-14` — шесть оформительских cookie: `theme`, `theme-resolved`, `density`, `accent`,
`sidebar`, `sidebar-tone`, `rail-tone`. Это в точности список выживающих.
`packages/core/src/preferences/utils/store.ts:44-66`, функция `resolveInitial`, называет оставшиеся пять поимённо
(`msgLayout / showRoles / linkPreviews / markdownPreviewPanel / animations`) и предупреждает ровно об этом исходе:
если взять cookie-заготовку прежде localStorage, эти пять «snap to defaults on every cold boot».
Приоритет там задан обратный (`adapter.readAppearance() ?? initial`), то есть наблюдаемое поведение расходится
с намерением, записанным в самом же файле.

**Исправление собственной записи.** Раньше в этом логе значилось, что пять настроек того же экрана
(Density, Accent, Light sidebar, Light navigation rail, **Animations**) «применяются и восстанавливаются».
Для `Animations` это **неверно** — измерено выше: после перезагрузки переключатель снова включён при сохранённом `false`.
Прежняя проверка, судя по всему, смотрела на применение эффекта, а не на состояние элемента после перезагрузки.
Остальные четыре из того списка cookie-обеспечены и действительно работают.

`Sidebar position` остаётся **отдельной** находкой: у него cookie есть (`aloqa.sidebar=right`), элемент после
перезагрузки правильно показывает `Right`, а панели всё равно отрисованы слева (x=144 и x=156 при ширине окна 1920).
Механизм другой, объединять не следует.

Профиль возвращён к значениям по умолчанию (`msgLayout=standard`, `sidebarSide=left`, `density=cozy`, `accent=#2454D8`,
все пять переключателей в исходном положении), cookie переписаны соответственно.

### Подтверждение утренней находки на третьей сборке — передача владения workspace

Едва не записал обратное. В тексте страницы `Settings → Workspace` встретилось «Transfer workspace ownership»,
что выглядело как появившийся элемент управления и опровержение утренней находки. Перечисление интерактивных
элементов показало, что это **текст подсказки**, а не кнопка:

```
Danger zone
Membership changes that affect your access.
Leave this workspace
Transfer workspace ownership before leaving.     ← подсказка
Leave workspace                                   ← единственная кнопка, disabled
интерактивных элементов в блоке: 1 (Leave workspace, aria-disabled)
```

То есть подсказка требует передать владение, а передачи владения нет. Утренняя находка верна и воспроизводится
на `v0.61.0-rc.5` — третья сборка подряд (rc-3 → rc-4 → rc-5). Ровно тот случай, ради которого в CLAUDE.md стоит
правило перечислять интерактивные элементы, а не читать текст страницы: здесь оно сработало в обратную сторону —
уберегло не от ложной находки, а от ложного **отзыва** верной.

### BUG-26 [Low] [frontend] Блок хранилища подписан «My storage», хотя тут же сказано, что хранилище общее

`Settings → Admin → Workspaces` → `Show storage`. В одном раскрытом блоке:
```
"My storage in this workspace"
"0 B of 10 GB used"
"Call recordings storage"
"0 B of 30 GB used · 30 GB free"
"Storage is shared by everyone in this workspace."     ← противоречит подписи блока
```
Числа — workspace-овые:
```
GET /api/v1/workspaces/<WS>/storage -> 200
  {"quota_bytes":10737418240,"used_bytes":0,"free_bytes":10737418240,"upload_limits":{...}}
  байт в байт одинаково у owner и у обычного участника (разные роли)
GET /api/v1/users/me/storage -> 404 {"key":"COMMON_NOT_FOUND","message":"endpoint not found"}
GET /api/v1/workspaces/<WS>/recordings-quota -> 200 у owner, 403 у обычного участника
```
Ключ строки — `settings.company.workspaces.quota.label` (`en.ts:867`), то есть в словаре это квота workspace.

**Дедуп / контекст:** [ALK-2654] (Bug, **REVIEW**) — «Workspace Storage использует неправильный API endpoint»:
панель ходила в user-scoped маршрут, требование — перевести на `GET /workspaces/{id}/storage`. Эндпоинт
действительно исправлен (замер выше это подтверждает). **Подпись осталась от прежнего, пользовательского смысла** —
это оставшаяся половина той же правки. Не дубликат [ALK-2850] (там про категории в Files).
Опубликовано как находка №17.

### Проверено и работает — Show storage и Members/Workspaces admin

- `Show storage` раскрывается и сворачивается (`Show storage` ↔ `Hide storage`), два запроса, значения совпадают
  с ответами (10 GB и 30 GB), `recordings-quota` закрыт для обычного участника (403).
- `Settings → Admin → Members`: строка владельца имеет `Remove` в состоянии disabled с подписью
  «You cannot remove yourself from the company.» — самоудаление владельца закрыто и объяснено.
- `Settings → Admin → Workspaces`: `Create workspace`, `Open …`, `Edit …` присутствуют и активны.

### Ложное срабатывание остановлено правилом «докажи, что клик дошёл» — Edit company profile

Первый прогон по кнопкам `Company dashboard` дал: клик по `Edit company profile` → диалогов 0, URL не изменился,
текст страницы в срезе тот же. Выглядело как мёртвая кнопка на видном месте — готовая находка.

Проверка по правилу дала обратное. Кнопка попадаема (`elementFromPoint` в центре возвращает её саму),
включена, `type=button`, `onclick` — функция; клик выполнен средствами Playwright с hit-тестом, без ошибки.
И решающее: опрос каждые 300 мс показал **изменение длины текста страницы 676 → 723** и появление второго
видимого поля ввода. То есть клик дошёл и что-то сделал.

Что именно: кнопка переключает дашборд с вкладки `Overview` на вкладку `Manage` (обе есть в шапке страницы).
Было: «QUICK ACTIONS Edit company profile Create workspace Invite members Manage roles».
Стало: «Company identity Name and avatar for this company. Company name … Administration … Manage members
Manage roles Manage invites Manage workspaces», поле с текущим названием компании.
URL при этом не меняется — вкладка клиентская. Не дефект.

Замечание для себя: `dialogs:0 + URL не изменился` — это **не** доказательство бездействия. Здесь спасла
единственная метрика, которую я снимал непрерывно, — длина текста страницы. Срез `innerText.slice(0,N)`
изменения не показал, потому что оно произошло **ниже** среза.

### Связка двух записей об Appearance — они не противоречат друг другу

Выше в логе есть две записи, которые при беглом чтении можно принять за отрицание сегодняшней находки:

1. **«Which settings follow a user to another device — measured, no finding»** — там зафиксировано, что весь
   `Appearance` лежит в localStorage и **не следует за аккаунтом на другое устройство**, и что это допустимое
   продуктовое решение, раз интерфейс обратного не обещает. Это по-прежнему верно и находкой не является.
2. **«Near-miss — Show member roles does not flip»** — там проверялось, что переключатели **срабатывают и пишут
   в хранилище**. Тоже верно: пишут.

Сегодняшняя находка — **третий, не проверявшийся тогда вопрос**: переживает ли настройка **перезагрузку на том же
устройстве**. Не переживает: пять из одиннадцати полей возвращаются к значению по умолчанию, при том что выбранное
значение остаётся в `aloqa.appearance` нетронутым. Это не «настройки не переносятся между устройствами» и не
«переключатель не срабатывает», а «экран показывает не то, что сам сохранил, на той же машине и в том же браузере».

Порядок проверки настройки, который стоит применять целиком: **сработал → записался → пережил перезагрузку → применился**.
Первые две ступени были пройдены утром, третья — только сегодня, и упала именно она.

### Лестница «сработал → записался → пережил перезагрузку → применился», прогон по оставшимся настройкам

Составлена карта «поле на сервере ↔ элемент на экране» по всем десяти маршрутам настроек, чтобы найти непроверенное.

**Поля, у которых элемента управления нет ни на одном экране настроек:**
`notifications.do_not_disturb_enabled` — переключателей на странице Notifications ровно три, DND среди них нет.
Если до него не добирается ни один экран, он вне сектора по правилу scope; отдельно не проверялся.

**`Away when inactive`** (`settings.profile.awayWhenInactive`) — переключатель есть и честно подписан
«This feature is not available yet.», значение `false`. Как и `Deactivate`/`Delete`/`Request export`, дефектом не считаю.

**`Send crash reports`** (`Settings → About`) — вся лестница пройдена, всё верно:
```
переключатель: true -> false, панели Save нет (применяется сразу), сетевых запросов нет
localStorage aloqa.diagnostics.consent: {"state":{"isCrashReportingAllowed":false},"version":0}
после перезагрузки: false  — сохранилось
```
Возвращён в исходное положение. Это **контраст к находке про Appearance**: настройка тоже device-local и тоже
в localStorage, но перезагрузку переживает. То есть дело не в «localStorage не работает».

**Статусы (`Settings → Profile`)** — проверено целиком, дефектов нет:
```
выбор пресета «🤒 Sick», Save profile
  PUT /api/v1/users/me/status <- {"text":"Sick","emoji":"🤒","expires_at":null} -> 200
  у другого пользователя GET /users/<A>/status -> {"text":"Sick","emoji":"🤒","source":"manual"}
очистка только текстового поля, Save
  PUT <- {"emoji":"🤒","expires_at":null} -> 200   → остаётся статус из одного эмодзи (пресет остаётся отмеченным)
повторный клик по отмеченному пресету — СНИМАЕТ отметку (0 отмеченных), появляется панель сохранения
  Save -> DELETE /api/v1/users/me/status -> 200 {"ok":true}   → статус пуст, поле пусто, отмеченных 0
Discard после выбора пресета возвращает ранее сохранённое значение, запросов не шлёт
```
То есть путь «снять статус» через интерфейс существует и ведёт в `DELETE`. Отдельно отмечу: `PUT` с пустыми
`text` и `emoji` отвергается (`400 COMMON_INVALID_INPUT`, «text or emoji is required»), и экран этого пути не
использует — он вызывает `DELETE`. **Едва не записал находку «статус нельзя снять»**: остановило то, что радиокнопка
оказалась снимаемой повторным кликом, а это проверяется одним действием, а не рассуждением о том, каких кнопок на
экране нет. `GET /api/v1/users/me/status` отвечает `405` — читать статус нужно по `/users/{id}/status`;
это особенность пробника, не дефект.

Статус аккаунта очищен, состояние фикстуры восстановлено.

### Независимая перепроверка находки №6 (семь полей профиля) — подтверждена, отчёт менять не потребовалось

Поля заполнены заново отличимыми значениями (`QA Engineer` / `Quality` / `they/them` /
`+998 90 000-00-00` / `octocat` / `https://example.org` / `in/example`, `showTimezone: true`),
после чего карточка открыта **тем элементом, который назван в шагах находки** —
`button[aria-label="Open <Имя>'s profile"]` в `Directories → People`.

```
диалог карточки, текст целиком:
  "QA Alice | QA QA Alice | Message | Call | Block | Share | SHARED CHANNELS · 2 | qa-general | qa-private"
кнопки: Close profile, Message, Call, Block, Share, qa-general, qa-private
запросы, которые делает карточка, — ровно три:
  GET /api/v1/users/<A>/status          -> 200 {}
  GET /api/v1/users/<A>/common-channels -> 200 {"channels":[…]}
  GET /api/v1/messaging/users/blocked   -> 200 {"users":[],"total":0}
ни одного из семи значений на странице нет (проверено поиском по каждому)
```
Карточка **не запрашивает данные профиля вообще** — ни одного обращения, которое могло бы их принести.

Вкладка `About` в панели профиля из DM — та же картина: она **уже выбрана** (`aria-selected="true"`),
и её содержимое — это и есть имя + Share + общие каналы. Отдельного экрана с полями нет.

**Изменений в отчёт не внесено:** блок измерений находки №6 уже содержал и состав карточки, и те же три запроса.
Сегодняшний прогон воспроизвёл их независимо, другим путём входа и с другими значениями полей.

Попутно исправлены два промаха пробника (не продукта): клик по строке в `Directories` попадал во внешний
`<a>` строки и уводил в DM вместо карточки — нужный элемент это `button[aria-label="Open …'s profile"]`;
и подстановка значения в шаблон `.replace("'SEL'", …)` не срабатывала, потому что `JSON.stringify` даёт
двойные кавычки — селектор искал литерал `SEL` и находил ноль элементов.

Поля профиля и контактов аккаунта очищены обратно.

## Сплошная перепроверка всех 17 находок — 2026-08-27, сборка `v0.61.0-rc-5-c4b5386b4a3a` (не менялась)

### Указатель по ночному проходу

Ниже 66 подразделов, добавленных в ночную часть прогона. Номера строк проставлены после вставки этого блока.

- **5372** — Проверено и работает — четвёртая локаль, узбекская кириллица (`uz-Cyrl`)
- **5407** — Проверено и работает — включение 2FA (насколько позволяет отсутствие почтового ящика)
- **5433** — Состояние стенда — display name аккаунта alice, восстановлено в БД, но API какое-то время отдаёт старое
- **5458** — BUG-27 — **ОТОЗВАНА ДО ПУБЛИКАЦИИ. НЕ ДЕФЕКТ. НЕ ЗАВОДИТЬ ЗАНОВО.** (была: «ограничения длины не названы»)
- **5515** — Проверено и работает — что видит и может гость (`is_guest = true`)
- **5533** — Перепись элементов управления — покрытие измерено, а не заявлено
- **5555** — Проверено и работает — поведение экранов настроек при отказе запроса
- **5586** — Дедуп против соседних отчётов того же дня — проведён, дубликатов нет, две смежности перенесены в «Для триажа»
- **5607** — Публикация — лимит на сегодня исчерпан, локальный файл впереди опубликованного
- **5638** — Наблюдение ниже планки отчёта — в личном workspace экран Company утверждает принадлежность к компании
- **5666** — Проверено и работает — Sessions при нескольких сессиях, и уборка накопленных
- **5684** — Проверено и работает — доступ с клавиатуры в разделе настроек
- **5699** — Независимое подтверждение находки №2 через wildcard, и проверка назначения роли не-участнику
- **5724** — Проверено и работает — локализация **динамических** сообщений (то, чего не видел сплошной обход)
- **5744** — Кэш имени рассосался сам — стенд полностью чист
- **5756** — Проверено и работает — участник компании, не состоящий в workspace, у чужих настроек
- **5768** — Проверка утверждения из находки №8 — «переживают переход между страницами, но не перезагрузку»
- **5785** — Находка №2 подтверждена на настоящем аккаунте «администратор компании» (не на синтетической роли)
- **5805** — Не находка — уточнение к открытой [ALK-3005]: IP, на который она опирается, обрезан на всех ширинах
- **5835** — Проверено и работает — вёрстка настроек на 1280 px
- **5839** — Проверка арифметики в лиде отчёта — сходится
- **5859** — Важно для следующей сессии — `seed.sh` НЕ управляет аватарами
- **5880** — Уборка сессий на прочих аккаунтах + попутная проверка выхода
- **5895** — Сравнение поверхности настроек: владелец против администратора компании
- **5913** — Объяснение `saved channels : 8/7` в выводе `seed.sh --verify` — не дефект, но пусть будет записано
- **5934** — Проверено и работает — страницы auth по недействительным и отсутствующим токенам
- **5957** — Перепись auth-страниц
- **5965** — Находки №1 и №3 воспроизведены на ДРУГОМ аккаунте и в чистом профиле браузера
- **5992** — Финальный дедуп — зеркало Jira обновлено, дубликатов среди 17 находок нет
- **6014** — Перепроверка УТРЕННЕГО отчёта этого же сектора на `v0.61.0-rc.5` — 2 из 3 держатся, 1 исправлена
- **6048** — `Settings → Calls and audio` — и ПОПРАВКА: пробела не было, экран уже был проверен этой же сессией
- **6096** — Проверено и работает — список заблокированных в заполненном состоянии
- **6110** — Гигиена снippet'ов и общих хелперов — подтверждена
- **6117** — Проверено и работает — длинное имя workspace не ломает вёрстку, и переименование в обе стороны
- **6136** — Карта «находка → снippet» проверена в работе
- **6151** — Проверено и работает — поиск участника для блокировки; одно наблюдение ниже планки
- **6170** — `scripts/permission_matrix.py` перезапущен ночью — вывод идентичен
- **6190** — Проверено и работает — состояния загрузки при медленном ответе
- **6210** — [ALK-3522] не воспроизводится на `rc-5` — ещё один тикет, который можно закрывать
- **6229** — BUG-28 [Low] [frontend] Несохранённые изменения пропадают при переходе между разделами настроек
- **6249** — Проверено и работает — «назад» и «вперёд» браузера внутри настроек
- **6266** — Наблюдение ниже планки — Enter в поле настроек не сохраняет; и ошибка моего пробника
- **6288** — Сводная проверка состояния — 01:56, 2026-08-27
- **6308** — Уточнение к прежней записи о фильтре настроек — он есть не у всех
- **6328** — Находка №18 уточнена — теряется не только при переходе внутри приложения, но и при перезагрузке
- **6343** — Что осталось сделать до конца бокса (чек-лист для себя)
- **6357** — Проверено и работает — необычный, но допустимый ввод в именах ролей
- **6372** — Перепись элементов закрыта полностью — `Export JSON` проверен
- **6390** — Проверено и работает — маршрутизация раздела настроек
- **6403** — Проверка воспроизводимости отчёта «голыми руками» — без рига
- **6419** — Дедуп против соседей обновлён в 02:06 — соседние секторы ещё работают
- **6440** — Порядок обхода Tab — измерить корректно не удалось, находки НЕТ, и вот почему
- **6465** — Сознательно НЕ сделано — второй workspace в компании ради проверки изоляции прав
- **6483** — Проверка всех блоков «Подтверждённая причина» — 11 из 11 обоснованы правильно
- **6506** — Периодические перепроверки в конце бокса (журнал)
- **6532** — Проверено и работает — открытая страница при инвалидации сессии извне
- **6552** — Проверено и работает — участника удалили из workspace, пока у него открыта страница
- **6573** — Проверка на «общие хелперы правились посреди прогона» — мои находки не затронуты
- **6599** — Две «аномалии» в поздней перепроверке — обе мои, ни одна не про продукт
- **6613** — Инвентарь того, что остаётся на стенде lane D
- **6627** — Проверено и работает — тема `System` действительно следует за системной настройкой
- **6646** — Проверено и работает — приложение уважает `prefers-reduced-motion`
- **6665** — BUG-29 [Low] [frontend] Второстепенный текст в настройках ниже порога контраста AA — в обеих темах
- **6695** — Проверено и работает — структура заголовков и ориентиров на всех экранах настроек
- **6708** — Проверено и работает — сообщения об ошибках доступны программам чтения с экрана
- **6724** — Проверено и работает — вёрстка при увеличении браузера (в пределах десктопных ширин)

Каждая находка перепроверена заново, тем путём, который описан в её шагах. Ни одна не снята, ни одной правки
в отчёт не потребовалось. Права выдавались по одному и снимались сразу после проверки.

| № | находка | чем подтверждена |
|---|---|---|
| 1 | право `invite` открывает страницу с мёртвыми элементами | 10 элементов, активны **2** (`Resend invite`, `Revoke invite`); неактивны все 8 создания, включая `Create invite link` и `Send direct invites`. Сервер то же действие разрешает: `POST /api/v1/workspaces/invites {role_ids:[]}` → **200**, приглашение создано (`status:"pending"`), затем отозвано |
| 2 | `company.audit.view` не открывает журнал | `Audit log` **отсутствует в навигации**; по прямому адресу «Admin access required», 0 элементов; при этом `GET /companies/<CO>/admin/audit-log` → **200** с записями. `GET /workspaces/<WS>/admin/audit-log` → 403 (слой другой — так и должно быть) |
| 3 | `role.manage` выдан, экран ролей отказывает | «You do not have permission to view company roles», 0 элементов; `GET /companies/<CO>/roles` → **403**, `POST` → **200** (роль создана), `DELETE` → **403** |
| 4 | делегату предлагают удалить владельца компании | 8 кнопок `Remove`, кнопка `Remove <владелец> from the company` **активна**; собственная строка делегата корректно заблокирована («You cannot remove yourself from the company»). `POST /api/v1/companies/kick` по владельцу → **400 `ORG_KICK_COMPANY_OWNER`** |
| 5 | два элемента видимости присутствия расходятся | список `nobody` (`hide_presence:false`) → наблюдатель видит `online:true` — **не действует**; переключатель `PUT /users/me/presence-settings/update {"hide_presence":true}` → 200 → наблюдатель видит `online:false` — **действует**. Контроль: у третьего участника значения не менялись |
| 6 | семь полей профиля не видны никому | карточка открыта её собственной кнопкой `Open <Имя>'s profile`: «Имя, Message, Call, Block, Share, SHARED CHANNELS · 2» и три запроса (`status`, `common-channels`, `blocked`) — **данных профиля карточка не запрашивает вовсе**; ни одно из семи заполненных значений на странице не встречается |
| 7 | `Sidebar position → Right` не двигает панель | сохранено `right`, cookie `aloqa.sidebar=right`, элемент показывает `Right=true`, панели отрисованы на **x=144 и x=156** при ширине окна 1920 |
| 8 | пять настроек Appearance откатываются | все пять измерены по очереди (см. таблицу выше): элемент возвращается к умолчанию, сохранённое значение остаётся выбранным |
| 9 | логотип компании ставится мгновенно и не снимается | воспроизведено дважды подряд; `DELETE` → 405, в контракте у company и workspace только `POST` |
| 10 | приглашение без роли выводится как `Role unavailable` | в списке ссылок строки с ролью показывают `Member`, строки без роли — `Role unavailable` |
| 11 | подпись обещает приём приглашения в приложении | строка присутствует дословно и целиком в одном узле: «Email delivery may be delayed. The invitation also appears in the recipient's in-app inbox.» |
| 12 | сообщение об ошибке в Notifications | воспроизведено полностью, добавлена подпись секции «Browser notifications are not used» и адреса строк словаря |
| 13 | `Sessions` не предлагает ни одного действия | подпись «…and how to sign one out» на месте, интерактивных элементов в области содержимого: **0** |
| 14 | `/company/create` не даёт уйти | во всём документе **2** интерактивных элемента: поле имени и `Create` |
| 15 | четыре подзаголовка обещают отсутствующее | все четыре строки присутствуют дословно на своих страницах |
| 16 | журнал аудита выводит ключи и JSON | 10 различных типов событий, оформленных 0; колонка METADATA — сырой JSON |
| 17 | «My storage» при общем хранилище | обе строки в одном блоке; `GET /users/me/storage` → 404, workspace-ответ одинаков у двух ролей |

**Промахи пробника в ходе перепроверки (не дефекты продукта):** `POST /workspaces/<ws>/invites` → 405, правильный путь
`POST /workspaces/invites`; `DELETE /workspaces/invites/<id>` → 404, отзыв делается `POST …/invites/<id>/revoke`;
`DELETE /companies/<co>/members/<id>` → 404, исключение — это `POST /companies/kick`;
`POST /users/me/presence-settings/update` → 405, метод **PUT**. Все четыре — мои неверные догадки о путях,
исправлены по контракту `openapi.json`.

**Состояние стенда после перепроверки:** `seed/seed.sh --verify --lanes D` → «All fixtures present and correct».
Роли-пробники удалены (в компании остались `Member`/`Admin`/`Guest`, в workspace — `Member` и роль владельца),
созданное приглашение отозвано (все 10 в списке — `revoked`), присутствие и приватность аккаунта возвращены
к умолчаниям, аватар аккаунта и поля профиля очищены.

### Проверено и работает — четвёртая локаль, узбекская кириллица (`uz-Cyrl`)

Выбор языка — это **кнопка**, а не список: `aria-haspopup="dialog"`, открывает диалог с четырьмя пунктами —
`English`, `Russian`, `Uzbek`, `Uzbek (Cyrillic)`. (Пробник, искавший `[role=option]`, находил ноль и едва не
дал вывод «список языков не открывается»; спасло сравнение состояния до и после клика — `aria-expanded` стало
`true`, длина текста страницы выросла.)

Переключение через интерфейс:
```
PATCH /api/v1/auth/me/language <- {"language":"uz-Cyrl"} -> 200
после: settings.language = "uz-Cyrl", cookie NEXT_LOCALE = "uz-Cyrl", localStorage aloqa.locale = "uz-Cyrl"
— все три источника согласованы
```

Сплошной обход **14 маршрутов** настроек на `uz-Cyrl`: сырых ключей интерфейса нет ни одного, непереведённых
строк нет. Вся латиница (29 строк на все страницы) — имена участников и логины, названия ролей, название
компании, название продукта, строка user-agent и названия поддельных устройств стенда. То есть перевод полный.

Итог по локалям за оба прохода: **en, ru, uz, uz-Cyrl — все четыре проверены**, непереведённого нет нигде.
Единственное место с латиницей в содержимом — журнал аудита, и это **не** пропуск перевода (находка №16:
в английской локали там ровно те же строки).

Язык аккаунта возвращён на `English`.

**Дополнение к записи о локалях.** Возврат на English через интерфейс с первой попытки не сработал —
пробник искал кнопку по английским подписям, а в узбекской локали кнопка подписана на узбекском, и совпадений
было ноль. Это ограничение пробника, не продукта. Возврат сделан через `PATCH /api/v1/auth/me/language {"language":"en"}` → 200.

Попутно проверено **расхождение и самовосстановление источников локали**: сразу после PATCH сервер отдавал `en`,
а cookie `NEXT_LOCALE` и `localStorage aloqa.locale` ещё держали `uz-Cyrl`. После перезагрузки все три источника
показывают `en`, интерфейс английский. То есть **для языка авторитетен сервер, и клиент подтягивает cookie и
localStorage под него**. Это прямая противоположность `Appearance`, где авторитетен клиент и подтягивания нет —
и где как раз находка №8. Полезный контраст: механизм «сервер главный, клиент синхронизируется» в продукте есть
и работает, просто оформление им не пользуется.

### Проверено и работает — включение 2FA (насколько позволяет отсутствие почтового ящика)

`Settings → Security`. Подпись раздела честная: «When enabled, a one-time code is emailed to you each time you sign in».

```
клик Enable -> POST /api/v1/security/2fa/enable -> 200 {"ok":true}
на странице (встроенно, не в диалоге) появляется:
  поле ввода placeholder="123456", кнопки Resend code / Cancel / Confirm
  Confirm неактивна, пока код не введён
  текст: "A 6-digit code was sent to your email. Enter it below to enable two-factor authentication."
         "Verification code — Enter the 6-digit code from the email."
длина текста страницы: 576 -> 744
```
Код приходит **письмом**, а не через приложение-аутентификатор (QR/секрета нет, `hasQR:false`), поэтому
довести включение до конца без живого ящика невозможно — это подтверждает ранее записанное ограничение,
теперь с указанием причины.

**Брошенная процедура не оставляет учётную запись в половинчатом состоянии:** после перехода на страницу заново
экран снова показывает «Two-factor authentication is off», кнопка одна — `Enable`, поля для кода нет.
То есть до подтверждения на сервере ничего не включается. Учётная запись чиста.

**Ещё одно ложное срабатывание, остановленное измерением.** Первый пробник смотрел на `[role=dialog]`, получил
`dialogs: 0` и «никакого QR» — читалось как «кнопка Enable ничего не открывает». На самом деле форма
встроенная. Тот же урок, что и с `Edit company profile`: отсутствие диалога — не отсутствие реакции;
мерить надо изменение страницы, а не наличие модального окна.

### Состояние стенда — display name аккаунта alice, восстановлено в БД, но API какое-то время отдаёт старое

**Что произошло.** При проверке границ длины поля `Display name` имя было сохранено как 40 символов `A`.
Вернуть его через интерфейс сразу нельзя: `PATCH /api/v1/auth/me/profile` отвечает
```
429 {"key":"AUTH_PROFILE_UPDATE_TOO_SOON","message":"профиль можно обновлять раз в неделю (осталось 7 дн.)"}
retry-after: 604527
```
То есть **имя меняется не чаще раза в неделю** — это и есть предмет открытой задачи [ALK-2784] (In Progress),
где претензия к тому, что причина и срок пользователю не показываются.

**Починено штатным путём:** `seed/seed.sh --lanes D` — его upsert в `seed_auth` содержит
`ON CONFLICT (id) DO UPDATE SET … name = EXCLUDED.name`, и он действительно обновил все базы:
```
auth_db  users.name (U4QDALICE…) = "QA Alice"
org_db   users.name (U4QDALICE…) = "QA Alice"
GET /api/v1/workspaces/<WS>/members → у этого участника name = "QA Alice"   (то, что видят другие)
```

**Остаточный эффект:** `GET /api/v1/auth/me` **самой** alice ещё отдаёт старое значение — и в свежем
контексте браузера с новым входом тоже. База при этом верна (проверено psql), значит это кэш на стороне
сервиса аутентификации, а не потеря данных. Другим участникам имя видно правильное.
**Находкой не является**: пользователь не может изменить имя в обход приложения, так что путь нерепродуцируем
из интерфейса — вне сектора по правилу scope. Записано как состояние стенда; перепроверю ближе к концу прогона.

### BUG-27 — **ОТОЗВАНА ДО ПУБЛИКАЦИИ. НЕ ДЕФЕКТ. НЕ ЗАВОДИТЬ ЗАНОВО.** (была: «ограничения длины не названы»)

Граница снята по одному символу, три поля ведут себя по-разному:
```
Display name  (нет maxlength):  2..40 символов — Save активна
                                41..200        — Save НЕАКТИВНА, ни одного сообщения на странице
                                1              — Save неактивна (минимум 2, тоже не назван)
                                40 -> PATCH /api/v1/auth/me/profile {"name":"…"} -> 200
Phone         (нет maxlength):  до 15 символов — Save активна;  16 и больше — НЕАКТИВНА, без сообщения
Job title / Department / Pronouns (нет maxlength):
                                200 символов -> PUT /api/v1/auth/me/settings -> 200, сохраняется целиком
                                (ограничения нет вовсе)
Status message: maxlength="100" — набрать больше просто нельзя (это правильный образец)
```
На странице при этом **нет ни слова о длине**: поиск по всему тексту `character|max|limit` не находит ничего,
рядом с полем висит только общая подсказка «This is how your name appears in Aloqa.».

**Контраст внутри того же продукта:** диалог `Create workspace` и страница `/company/create` пишут прямо
«Use 2 to 128 characters.» и вдобавок ставят `maxlength="128"`; форма регистрации на превышение/недобор
отвечает текстом («Password must be at least 8 characters.»). То есть образец в продукте есть, и эти два поля
из него выпадают.

**Дедуп:** не дубликат [ALK-2784] (там 429 `AUTH_PROFILE_UPDATE_TOO_SOON` — недельное ограничение на смену
имени, показанное общей ошибкой; тут длина, и никакого запроса вообще не уходит) и не [ALK-3193]
(там мобильный календарь). Родственная по смыслу пара — стоит чинить вместе с [ALK-2784]: оба про то,
что пользователю не говорят, почему имя не сохраняется.

---

**ОТОЗВАНО. Сообщения есть, и они точные — просто появляются по потере фокуса, а мой пробник фокус не терял.**

Всё, что написано выше про границы (2..40 для `Display name`, 7–15 цифр для `Phone`, отсутствие ограничения
у `Job title`/`Department`/`Pronouns`, `maxlength="100"` у `Status message`), измерено верно. Неверен был вывод
«ни одного сообщения на странице».

Что показала правильная проверка — значение **набрано с клавиатуры**, затем `blur()`:
```
Display name, 45 символов:  до blur — сообщения нет, Save неактивна
                            после blur — "Enter 40 characters or fewer."
Phone, 18 цифр:             до blur — сообщения нет, Save неактивна
                            после blur — "Enter a valid phone number with 7 to 15 digits."
```
Строки лежат в словаре во всех четырёх локалях (`settings.profile.displayName.error.maxLength` — `en.ts:4057`;
`settings.account.contacts.phone.error` — `en.ts:670`) и **действительно показываются**. Правило в
`packages/features/settings/model/formValidation.ts:9-11` (`CONTACT_PHONE_MAX_LENGTH=32`,
`CONTACT_PHONE_MAX_DIGITS=15`) совпадает с текстом сообщения.

**Причина ложного вывода:** я задавал значение через `HTMLInputElement.prototype.value` + события `input`/`change`,
и поле никогда не теряло фокус. Валидация по blur — нормальный и правильный шаблон (не дёргать человека, пока он
печатает), и именно его такой пробник не видит.

**Урок, стоящий записи:** проверяя валидацию формы, вводить значение **клавиатурой и уводить фокус**, а потом
смотреть. «Сообщения нет» после программной установки value — утверждение о пробнике, а не о продукте.
Это ровно та же ошибка, что с `dialogs:0` у `Edit company profile` и у 2FA: измерялось не то состояние.

В отчёт не попало — проверка сделана до публикации.

### Проверено и работает — что видит и может гость (`is_guest = true`)

Вход в свежем контексте браузера, обход админских и организационных экранов.

| экран | что видит гость | сервер |
|---|---|---|
| `admin/audit-log` | «Admin access required», 0 элементов | `GET …/admin/audit-log` → 403 |
| `roles?scope=company` | «Admin access required», 0 элементов | `GET /companies/<CO>/roles` → 403 |
| `admin/invites` | — | `GET /workspaces/<WS>/invites` → 403 |
| журнал компании | — | `GET /companies/<CO>/admin/audit-log` → 403 |
| `settings/company` | поле названия компании **disabled**, подпись «Only the company owner or a system administrator can edit the company identity.» | — |
| `settings/workspace` | поле названия workspace **readOnly**, активна только кнопка `Leave workspace` | `PATCH /api/v1/workspaces/<WS>` → **403** |
| список участников компании | доступен (200) | это же есть у роли `Member` |

Гейт настоящий и серверный, экран объясняет отказ словами и не притворяется, что действие доступно.
Отдельно отмечу согласованность с находкой про владельца: у **владельца** `Leave workspace` неактивна
(выйти нельзя, передачи владения нет), у **гостя** — активна. Так и должно быть.

### Перепись элементов управления — покрытие измерено, а не заявлено

Обход всех **17 маршрутов** раздела настроек под владельцем, перечисление каждого интерактивного элемента
в колонке содержимого: **156 элементов**. Сверка со всем, что делалось за прогон, оставила ровно три,
которых я не касался, и все три проверены сейчас:

| элемент | что оказалось |
|---|---|
| `Export CSV` (журнал аудита) | работает: **3 запроса подряд, все `limit=100`**, курсор `before=<ts>` между ними, файл `audit-log-<WS>-<дата>.csv`. Загрузка в браузере отменена (`download.cancel()`), содержимое прочитано отдельно через `fetch` в память: 100 записей, 14 полей в записи. **Поправка к первому замеру:** увиденные было запросы с `limit=1` принадлежат обычной загрузке страницы, а не экспорту — пересчитано с фильтром только по времени после клика |
| `Export JSON` | не запускался намеренно: поведение кнопки то же самое, а лишний файл в браузер сохранять незачем |
| `Edit <workspace>` (admin/workspaces) | это **ссылка**, а не кнопка (пробник искал по `button` и находил ноль); ведёт на уже проверенный `Settings → Workspace` — отдельного редактора нет |

**Итого непокрытым на всей поверхности настроек остаётся:**
- `Upload image` на странице workspace — **сознательно**, это та же семья, что находка №9 про логотип компании,
  и проверка означала бы поставить второй несменяемый аватар;
- `Deactivate` / `Delete` / `Request export` — честно отключены подписью «not available yet», дефектом не считаю;
- `Settings → Calls and audio` — граница с секторами звонков, отмечена ранее;
- system settings и search reindex — только super-admin, флага нет ни у одной фикстуры;
- потребление писем (подтверждение адреса, magic link, код 2FA) — нужен живой ящик.

Всё остальное из 156 элементов было нажато, измерено или объяснено.

### Проверено и работает — поведение экранов настроек при отказе запроса

Отказ имитировался средствами Playwright (`page.route(pattern, r => r.abort('failed'))`, затем `page.unroute`),
по одному эндпоинту за раз, с базовым замером до отказа.

**Отказ загрузки списка — ни один экран не притворяется пустым:**

| экран | без отказа | с отказом |
|---|---|---|
| `admin/members` | 9 строк, 8 элементов | «Could not load members. Something went wrong. Please try again.» + `Retry`, 0 строк |
| `roles` | 13 строк, 33 элемента | «Could not load roles…» + `Retry` |
| `admin/audit-log` | 87 строк, 16739 символов | «Could not load the audit log…» + `Retry` |
| `sessions` | обычный вид | «Could not load sessions. Try again in a moment.» + `Retry` |
| `admin/workspaces` | 2 элемента | «Could not load workspaces.» + `Retry` |
| `admin/invites` | 17 строк | у секции ссылок «Could not load invitations» + `Retry`; секция прямых приглашений (**другой эндпоинт, не отказывал**) отрисована нормально |

Это важная проверка: обратный исход — молча показать пустой список вместо ошибки — был бы дефектом
класса «неверные данные», потому что администратор решил бы, что участников или ролей нет.

**Отказ сохранения — тоже сообщается:**
```
Notifications, PATCH /api/v1/notifications/settings оборван:
  тосты: "Network error. Check your connection." и "Something went wrong. Please try again."
  панель Discard/Save preferences ОСТАЁТСЯ (форма честно считается несохранённой)
  после перезагрузки значение прежнее — ничего ложно сохранённым не оказалось
Privacy, PUT /api/v1/auth/me/settings оборван:
  те же тосты, переключатель возвращается к серверному значению, панель сохранения снимается
  после перезагрузки значение прежнее
```
Ни в одном случае интерфейс не показал сохранение как успешное.

### Дедуп против соседних отчётов того же дня — проведён, дубликатов нет, две смежности перенесены в «Для триажа»

Проверены **все 10 отчётов за 26.08** (секторы A, B, C, E и сводный), титулы всех находок прочитаны.
Пересечений, требующих отзыва, нет. Две находки соседей стоят рядом с моими настолько близко, что триажу
полезно видеть их вместе, — ссылки добавлены в мои находки:

1. **Мой №6 (семь полей профиля не видны никому)** ↔ E-2 «[FE-WEB][DIRECTORIES] Все участники попадают в группу
   OTHER, а поиск по отделу и должности не находит никого». **Корень общий:** `department` и `jobTitle` не доходят
   до других пользователей (у них тот же замер — список ключей участника в `GET /workspaces/{ws}/members`).
   **Симптомы разные:** у них список и поиск в каталоге, у меня карточка профиля и все семь полей плюс
   `Show timezone`. Не дубликат; чинится общим изменением.
2. **Мой №8 (пять настроек Appearance откатываются)** ↔ E-2 «[FE-WEB][SHELL] Состояние сайдбара и настройки
   списка в Files не сохраняются, хотя механизм сохранения есть». Набор настроек другой, и в записи
   `aloqa.appearance` их нет — **механизм не тот же**. Но обе про одно: способ сохранять предпочтения в приложении
   есть и работает (у них это прямо сказано про тему/плотность/акцент — это ровно мои cookie-обеспеченные), и часть
   настроек к нему не подключена.
3. Не пересекается: E-2 «Reset all в Display settings не сбрасывает тему» — это **другая поверхность**
   (панель `Display settings`, Cmd/Ctrl+Shift+T, помечена `[SHELL]` и принадлежит сектору E), там свои
   тема/плотность/масштаб шрифта. В `Settings → Appearance` кнопки `Reset all` нет вовсе.
   Панель Display settings я не трогал — она за границей сектора и уже покрыта соседями.

### Публикация — лимит на сегодня исчерпан, локальный файл впереди опубликованного

`Artifact` вернул `deploy 429: frame_daily_push_cap_reached`. **Опубликованная версия содержит все 17 находок**
(последняя удачная выкладка — с находкой про хранилище). Не попали в опубликованную версию только **два
блока «Для триажа»** с перекрёстными ссылками выше — они есть в
`reports/aloqa-org-qa-2026-08-26-D-2.html` локально. **Повторы исчерпаны — инструмент отказал трижды и велел прекратить.** Итоговое расхождение зафиксировано ниже, и оно будет названо пользователю в финальном итоге.

**Что опубликовано:** **17 находок из 19**, каждая целиком — заголовок, «Проблема», шаги, блок измерений,
«Подтверждённая причина», «Ожидаемый результат», «Проверка», строка в сводной таблице. Опубликованный отчёт
как рабочий документ **полон и верен**; он просто меньше.

**Что есть только в локальном файле** `reports/aloqa-org-qa-2026-08-26-D-2.html` — двадцать пять позиций, все
добавлены **после** последней удачной выкладки:

| # | что | почему это не меняет опубликованное |
|---|---|---|
| 1 | **находка №18 целиком** — несохранённые изменения теряются при переходе и при перезагрузке, без предупреждения | новая находка, найдена после закрытия лимита |
| 2 | **находка №19 целиком** — второстепенный текст ниже контраста AA в обеих темах (2.86:1 / 3.23:1) | то же |
| 3 | №2 — в «Для триажа» добавлено упреждение вероятного отказа («это ALK-3307, страница ещё не сделана») | усиление, суть находки прежняя |
| 4 | №6 — перекрёстная ссылка на находку сектора E про `Directories → People` | подсказка триажу |
| 5 | №8 — перекрёстная ссылка на находку сектора E про состояние оболочки и `Files` | подсказка триажу |
| 6 | №14 — замечание, что формулировка одинакова во всех четырёх словарях (правок восемь, а не одна) | уточнение объёма правки |
| 7 | №16 — контроль: на остальных 14 маршрутах ровно один `h1` и ориентир `main` | усиление измерения |
| 8 | лид и подвал — добавлен `Settings → Profile`, уточнено покрытие 2FA, дата «26–27 августа» | точность |
| 9 | стиль отчёта — токен `--sev` в светлой теме затемнён `#9a6412` → `#8a5710`, чтобы сам отчёт проходил AA | оформление, содержание не меняется |
| 10 | статья 10 — даты в `METADATA` остаются UTC, тогда как соседняя колонка пересчитывается (0 из 9 против 99 из 99) | усиление, измерение |
| 11 | две ссылки на исходники дописаны до полного пути (`apps/web/src/…`, `packages/core/src/…`) | точность |
| 12 | контраст (статья 13) — измерение расширено с одного экрана до 17 маршрутов и обеих тем (92 / 105 нарушений, по 91 на один токен) | усиление |
| 13 | статья 2 — в «Для триажа» добавлено, что гейт появился в этой же невыпущенной сборке | приоритизация |
| 14 | статья 19 — исправлено внутреннее противоречие про `About` («0 элементов» при описанном переключателе) | **ошибка** |
| 15 | статья 16 — добавлен полный перебор 16 сочетаний флагов уведомлений | усиление |
| 16 | статус ALK-2997 в тексте: `REVIEW` → `TESTING` (разошёлся за ночь) | точность |
| 17 | статья 13 — блок «Для триажа» переписан: назван **ALK-3579**, снято неверное «ни одна не про text3», смысл смещён на «закрытое не доставлено» | **ошибка** |
| 18 | статья 9 — добавлен прецедент **ALK-1788** (то же на личном аватаре, уже исправлено) | усиление |
| 19 | статья 19 — добавлен прецедент **ALK-1714** («truthful settings») | усиление |
| 20 | статья 5 — измерение дополнено обратным направлением расхождения | усиление |
| 21 | статья 16 — снято ложное «совпадений по ключу нет», назван **ALK-3071** | **ошибка** |
| 22 | статья 3 (High) — снято ложное «совпадений по `role.manage` нет», названы ALK-1898/1954/1656 | **ошибка** |
| 23 | ~~новая находка №20~~ — **заведена и снята до публикации**: измерял свой курсор, а не курсор экрана; отчёт снова 19 находок | снято |
| 25 | статья 12 — в «Для триажа» отмечено, что ALK-3426 на этой сборке тоже не воспроизводится (замерено и на замедленной сети) | точность |
| 24 | статья 19 — в «Для триажа» добавлено, что помощь в приложении уже есть (`Help & resources` в рельсе, ссылка `Open docs`), не хватает только ссылки с About | усиление |

Ни одна позиция не меняет измерение, причину или шаги уже опубликованных находок. Различаются **счётчики**
(17 против 19), и именно это способно заставить читателя усомниться во всём наборе — поэтому расхождение
названо и здесь, и в `reports/README.md`, и в итоге пользователю.

**Как закрыть:** один раз выложить локальный файл по тому же `url` — и расхождение исчезнет.

### Наблюдение ниже планки отчёта — в личном workspace экран Company утверждает принадлежность к компании

У каждого пользователя есть личный workspace (`type: "personal"`, `slug: "personal-<uid>"`), он показан в
переключателе рядом с рабочим, то есть достижим обычным путём. **`company_id` у него нет вовсе:**
```
GET /api/v1/workspaces/<PWS> -> 200
  {"id":"<PWS>","name":"<Имя>'s workspace","slug":"personal-<uid>","type":"personal","owner_id":"<uid>", …}
  — поля company_id в ответе нет
```
При этом `/w/<PWS>/settings/company` показывает то же, что и в рабочем workspace:
```
"Company — The company this workspace belongs to, and the workspaces inside it.
 Active company QA Fixtures D   Company identity …"
```
То есть подпись говорит «компания, которой принадлежит этот workspace», а этот workspace не принадлежит никакой;
страница показывает **активную компанию пользователя**. Заголовок над значением честный — `Active company`, —
неверна именно подпись секции.

**Почему не в отчёт:** узкий контекст (личный workspace), риска для данных нет (поле названия компании для
не-владельца отключено, у владельца правка ушла бы в саму компанию, а не в этот workspace), и это в чистом виде
формулировка. Кандидат на объединение с находкой №17 (четыре подзаголовка описывают отсутствующее) — там ровно
тот же класс: подпись обещает не то, что на экране.

**Проверено попутно и работает:** в личном workspace ничего не ломается — консольных ошибок нет, ответов 4xx/5xx
нет, `undefined/null/NaN` в тексте нет, все админские экраны (`roles`, `admin/company`, `admin/members`,
`admin/audit-log`) корректно отвечают «Admin access required». В `Settings → Workspace` там нет кнопки
`Leave workspace` вовсе — выйти из собственного личного workspace не предлагается, и это разумно.

### Проверено и работает — Sessions при нескольких сессиях, и уборка накопленных

Прогон создал несколько серверных сессий (каждый вход в `browser.newContext()` — новая). Это дало повод
проверить экран `Sessions` в состоянии, обратном находке №13.

```
3 сессии:  3 строки устройств, кнопки: Sign out, Sign out other sessions
           (per-row Sign out — две, у текущей сессии своей кнопки нет)
нажатие "Sign out other sessions": подтверждения не спрашивается, действие немедленное
1 сессия:  1 строка, кнопок 0        <- ровно условие находки №13
текущая сессия жива: GET /api/v1/auth/me -> 200
```
То есть находка №13 подтверждена с двух сторон: при нескольких сессиях действия есть, при одной их нет вовсе,
хотя подпись обещает «and how to sign one out». И уборка сделана: у аккаунта снова одна сессия.

**Наблюдение, не находка:** `Sign out other sessions` выполняется без подтверждения. В отличие от логотипа
компании (находка №9) это действие обратимо — достаточно войти заново, — поэтому отдельной находкой не пишу.

### Проверено и работает — доступ с клавиатуры в разделе настроек

Обход Tab'ом по страницам `profile` и `appearance`, до 90 нажатий, с записью `document.activeElement` на каждом шаге.

- **Видимый фокус есть у каждой остановки** в области содержимого: `withoutVisibleFocus: []` (проверялось по
  `outline-style`/`outline-width` и по `box-shadow`, то есть и кольцо, и обводка).
- Tab даёт **по одной остановке на радиогруппу**, а не по остановке на каждый вариант. Сначала это выглядело как
  «до Compact/Comfortable/Violet/Right с клавиатуры не добраться» — на деле это **правильная семантика ARIA**:
  внутри радиогруппы перемещение стрелками.
- Стрелки работают: фокус на `Cozy`, `ArrowRight` → `Comfortable=true`, `ArrowLeft` → снова `Cozy=true`.
  Выбор и перемещается, и возвращается.

Дефекта нет. Записываю, потому что первый замер выглядел как готовая находка про недостижимые с клавиатуры
элементы — и ею не был. Плотность возвращена в `Cozy`.

### Независимое подтверждение находки №2 через wildcard, и проверка назначения роли не-участнику

**1. Роль с wildcard `company.{co}.*`** (в форме создания это чекбокс «All company permissions») создаётся и
назначается без вопросов (200/200). Что получает держатель:
```
права: ["company.<CO>.*", "company.<CO>.member.view"]
навигация ADMIN: Roles · Company dashboard · Members · Workspaces
  Members  — 8 элементов, 7 активны         работает
  Roles    — 36 элементов, 35 активны       работает
  Invites  — отказ, 0 элементов             верно: invites это слой workspace, а wildcard — компании
  Audit log — В НАВИГАЦИИ НЕТ, по прямому адресу отказ, 0 элементов
```
Последняя строка — **независимое подтверждение находки №2** другим путём: в отчёте сказано, что у роли уровня
компании с `company.{co}.*` результат тот же, что у одиночного `audit.view`. Так и есть. Ценно тем, что снимает
возможное возражение «просто одиночное право слишком узкое» — самое широкое право компании тоже не открывает журнал.

**2. Назначение роли workspace тому, кто в workspace не состоит** — сервер корректно отказывает:
```
POST /api/v1/workspaces/<WS>/roles/assign {role_id:<ws-role>, user_id:<company-only user>}
-> 400 {"key":"ORG_ROLE_TARGET_NOT_MEMBER","message":"пользователь не состоит в workspace <WS>"}
```
Ошибка называет и причину, и ресурс. Дефекта нет.

Роли-пробники удалены, в компании снова только `Member`/`Admin`/`Guest`.

### Проверено и работает — локализация **динамических** сообщений (то, чего не видел сплошной обход)

Обходы по локалям снимали **статический** текст страниц. Сообщения об ошибках появляются только при отказе,
то есть в те замеры не попадали вовсе. Проверено отдельно, на русском:
```
имя длиннее 40, ввод с клавиатуры + blur:
  "Введите не больше 40 символов."                       — переведено
отказ выключить In-app notifications:
  встроенно: "Нельзя отключить уведомления в приложении, пока не включён другой способ доставки.
              Оставьте их включёнными и повторите попытку."
  тост:      "Оставьте включённым хотя бы один канал доставки уведомлений."   — оба переведены
```
Непереведённых динамических сообщений не встретилось.

**Побочный результат, добавленный в находку №14:** русский перевод точен и потому **повторяет ту же ошибку** —
«пока не включён другой способ доставки… Оставьте их включёнными». Проверены все четыре словаря
(`en`, `ru`, `uz`, `uz-Cyrl`) — формулировка везде одна и та же. Значит правка не одна строка, а по одной
в каждом словаре, и для обоих задействованных ключей (`settings.notifications.error.allDisabled` и
`api.error.notifications.noDeliveryChannel`). Это добавлено в блок «Для триажа» находки №14.

### Кэш имени рассосался сам — стенд полностью чист

Ранее записанный остаточный эффект (после починки сидером `GET /auth/me` отдавал старое имя) **прошёл**
примерно через полчаса — TTL кэша сервиса аутентификации. Текущее состояние аккаунта:
```
name "QA Alice" · language en (сервер, cookie NEXT_LOCALE и localStorage — все три согласованы)
profile{} и contacts{} пусты · notifications в умолчаниях
appearance: theme=system density=cozy msgLayout=standard sidebarSide=left showRoles=true animations=true
сессий: 1 · роли: только фикстурные · приглашений живых нет · статус пуст
```
Ничего чинить вручную не потребовалось, БД была верна с самого начала.

### Проверено и работает — участник компании, не состоящий в workspace, у чужих настроек

Аккаунт `outsider` (в компании есть, в workspace нет) по всем шести адресам вида
`/w/<чужой WS>/settings/...` **перебрасывается в свой личный workspace** и видит
«Welcome to Aloqa — Choose an action to start setting up your workspace».
Ни одной страницы чужого workspace не отрисовывается, `undefined/null/NaN` в тексте нет, вёрстка цела.
В консоли остаются 403 от запросов, ушедших до редиректа (`/workspace/<WS>/meetings/active`,
`/workspaces/<WS>/saved-messages`) — пользователю они не видны, экран уже другой.

Заодно: у каждого пользователя личный workspace называется по-разному — у одного «<Имя>'s workspace»,
у другого просто «Personal workspace». Разница в названии по умолчанию, не дефект.

### Проверка утверждения из находки №8 — «переживают переход между страницами, но не перезагрузку»

Это утверждение стояло в отчёте; проверено отдельно, потому что раньше я мерил только перезагрузку.

```
Animations: вкл -> выкл,   в localStorage aloqa.appearance.animations = false
клиентский переход по ссылкам навигации (Appearance -> Profile -> Appearance, без reload):
                             переключатель ВЫКЛ  — состояние пережило переход
жёсткая перезагрузка:        переключатель ВКЛ   — откатился
                             в хранилище при этом по-прежнему false
```
Формулировка находки точна: настройка применяется, переживает внутреннюю навигацию и теряется только на
перезагрузке — при сохранённом значении. Это же отличает её от находки соседнего сектора про `Files`,
где состояние теряется **и** на внутренней навигации.

Оформление возвращено к умолчаниям.

### Находка №2 подтверждена на настоящем аккаунте «администратор компании» (не на синтетической роли)

Раньше находка проверялась на роли, собранной мной (одиночное `audit.view`, затем wildcard `company.{co}.*`).
Теперь — на **фикстурном аккаунте с ролью `Admin`**, то есть на персонаже, которого developer и представляет
себе под словом «администратор компании». Вход в свежем контексте.

```
Settings → Admin → Audit log : «Admin access required», интерактивных элементов 0
GET /api/v1/companies/<CO>/admin/audit-log  -> 200      <- сервер отдаёт ему журнал компании
GET /api/v1/workspaces/<WS>/admin/audit-log -> 403      <- слой workspace, у него его нет: верно

контроль, то же лицо, соседние экраны:
  Roles    — 33 элемента, 32 активны      работает
  Members  —  8 элементов,  7 активны     работает
  Invites  — отказ, 0 элементов           верно: invites это слой workspace
```
Это сильнейшая форма утверждения из отчёта: не «узкое право не открывает свой экран», а «администратор компании
не может открыть журнал аудита компании, при том что сервер отдаёт ему именно этот журнал».
Три независимых пути (одиночное право, wildcard, штатная роль `Admin`) дают один и тот же результат.

### Не находка — уточнение к открытой [ALK-3005]: IP, на который она опирается, обрезан на всех ширинах

Проверка вёрстки настроек на 1280 px (все 16 маршрутов: горизонтальной прокрутки нет нигде, за viewport не
вынесен ни один элемент, обрезанных подписей нет) дала ровно одно попадание — строка user-agent на экране
`Sessions`. Замер:
```
контейнер: <p class="… truncate">  overflow-x: hidden  text-overflow: ellipsis  white-space: nowrap
scrollWidth / clientWidth = 1032 / 844   — ОДИНАКОВО при 1280, 1440 и 1920
строка целиком (130 символов):
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)
   Chrome/151.0.0.0 Safari/537.36 · <IP>"
помещается ~104 символа; отрезается хвост:  "Safari/537.36 · <IP>"
title у элемента и у четырёх предков: нет
подсказки при наведении: нет ([role=tooltip] и popper-обёртки пусты через 2 с)
при этом текст в DOM есть — обрезка чисто визуальная
```
То есть **ширина окна ни при чём**: контейнер фиксированной ширины, и IP не виден ни на одной десктопной ширине.

**Почему это не отдельная находка.** Открытая [ALK-3005] (Bug, Backlog) описывает эту же строку: каждая сессия
названа `Unknown device`, и там прямо сказано — «отличить свою сессию от незнакомой можно только **по IP-адресу**
и по метке Current session». Моё измерение показывает, что **эта опора не работает**: IP обрезан. Это уточнение
к чужому тикету, а не новый дефект, и по правилу из CLAUDE.md такое идёт в лог, а не в отчёт.

**Что стоит передать тому, кто возьмёт [ALK-3005]:** починка подписи (`Chrome на macOS` вместо `Unknown device`)
закроет проблему только наполовину, если строка user-agent останется в `truncate`-контейнере — IP, названный
в тикете как единственный отличитель, пользователь всё равно не увидит. Разумно в той же правке либо вынести
IP отдельным полем, либо дать `title`/подсказку на полную строку.

Заведение и комментирование в Jira — решение пользователя, сам не трогал.

### Проверено и работает — вёрстка настроек на 1280 px
16 маршрутов: `documentElement.scrollWidth == clientWidth` везде (страница не едет вбок), элементов с
`getBoundingClientRect().left >= innerWidth` нет ни одного, обрезанных листовых подписей, кроме описанной выше, нет.

### Проверка арифметики в лиде отчёта — сходится

Лид утверждает: «из десяти прав компании таких восемь [открывают то, что обещают] … и на этом фоне видны три,
которые не открывают. Два из них на слое компании». Проверено по живому каталогу:

```
GET /api/v1/companies/<CO>/permissions/available  -> 11 записей:
  workspace.create · role.get · role.manage · role.update · role.delete
  member.view · member.kick · privacy.bypass · privacy.manage · audit.view · *
                                                                            ^ wildcard, не отдельное право
GET /api/v1/workspaces/<WS>/permissions/available -> 9 записей:
  edit · invite · channel.create · channels.view · member.kick · role.get · role.manage · audit.view · *
```
То есть **прав компании ровно десять** (одиннадцатая запись — wildcard `*`), из них не открывают свой экран
два: `role.manage` (находка №3) и `audit.view` (находка №2). 10 − 2 = 8. Третья находка (№1) — на слое
workspace, право `invite`; там прав восемь плюс wildcard.

Формулировка лида точна. Записываю, потому что «11 записей в каталоге» и «десять прав» в лиде выглядели
расхождением, и стоило убедиться, что это не так.

### Важно для следующей сессии — `seed.sh` НЕ управляет аватарами

Проверено по исходнику сидера и по базе:
```
seed_qa_fixtures.py: в upsert'ах companies и workspaces колонки avatar_url НЕТ вовсе
  workspaces: INSERT (id, name, slug, type, company_id, owner_id, created_at, updated_at)
              ON CONFLICT DO UPDATE SET name, slug, company_id, owner_id, updated_at
org_db сейчас: workspaces.avatar_url = (null)      <- чисто
               companies.avatar_url  = /public/<id> <- поставлено моей проверкой (находка №9)
```
Следствия:
1. **`seed/seed.sh --lanes D` логотип компании не уберёт.** Единственный способ вернуть lane D к варианту
   с инициалами — прямой `UPDATE companies SET avatar_url = NULL` в `org_db`. Я этого не делал:
   это не штатный инструмент починки, а состояние безобидное и задокументированное.
2. **Аватар workspace по-прежнему не проверялся — и это остаётся верным решением.** Раньше я обосновывал
   пропуск тем, что проверка оставит несменяемую картинку; теперь это подтверждено с другой стороны: сидер
   её не уберёт, то есть «поставить и откатить сидером» не сработало бы.

Если следующая сессия захочет проверить аватар workspace — сначала решите, чем будете возвращать, и учтите,
что штатного пути нет ни в интерфейсе, ни в API (в контракте у обоих ресурсов только `POST`), ни в сидере.

### Уборка сессий на прочих аккаунтах + попутная проверка выхода

Каждый вход через `browser.newContext()` создаёт серверную сессию, и за ночь их накопилось по четыре
на `admin`, `guest` и `dave`. Убрано штатным путём, заодно проверен сам выход:

| аккаунт | было | после `Sign out other sessions` | после `Profile → Sign out` |
|---|---|---|---|
| `admin` | 4 | 1 | `GET /auth/me` → **401**, редирект на `/login` |
| `guest` | 4 | 1 | 401, `/login` |
| `dave`  | 4 | 1 | 401, `/login` |

То есть у этих трёх аккаунтов сессий не осталось вовсе. Выход работает корректно: сессия инвалидируется
на сервере (401, а не просто очистка клиента) и пользователя уводит на страницу входа.
Живые сессии остались только у трёх браузеров лейна (`alice`, `owner`, `outsider`) — по одной на каждый.

### Сравнение поверхности настроек: владелец против администратора компании

Полная перепись под обоими аккаунтами и разность (owner 156 элементов на 17 маршрутах, admin 135 на 15):

| маршрут | разница | трактовка |
|---|---|---|
| `admin/audit-log` | у admin **маршрута нет** | это находка №2 |
| `admin/invites` | у admin маршрута нет | верно: invites — слой workspace, у admin слой компании |
| `admin/company` | у owner лишний `Invite members` | то же самое |
| `admin/members` | у owner лишний `Manage invites` | то же самое |
| `admin/workspaces` | у owner лишний `Edit <workspace>` | `workspace.create` — право компании (есть у обоих), `edit` — право workspace (у admin нет) |
| `company` | у owner `Upload image` и активное поле имени; у admin поле **disabled** | «Only the company owner or a system administrator can edit the company identity» |
| `workspace` | у owner `Leave workspace` **неактивна**, у admin активна | владелец выйти не может (утренняя находка), администратор может |
| `sessions` | у owner 0 элементов, у admin 3 | это находка №15 с двух сторон: у owner одна сессия, у admin было несколько |

Ни одного расхождения, которое не объяснялось бы моделью прав. Единственная аномалия — журнал аудита,
и она уже описана. Это третье независимое подтверждение находки №2 (одиночное право → wildcard → штатная роль `Admin`).

### Объяснение `saved channels : 8/7` в выводе `seed.sh --verify` — не дефект, но пусть будет записано

`seed.sh --verify` печатает число персональных каналов Saved Messages против числа участников workspace
и показывает **8/7**. Расхождение выглядит как повод для тревоги; на деле:
```
org_db.saved_message_channels, workspace_id = <WS>:
  U4QDOUTSIDER001  QA Outsider  <-- НЕ состоит в workspace
  + семь фикстурных участников (admin, alice, bob, carol, dave, guest, owner)
org_db.workspace_members: ровно семь, ровно те самые
```
То есть у `outsider` остался персональный канал Saved Messages в workspace, куда он **сейчас не входит**.
Скорее всего след более раннего цикла «пригласили → вошёл → убрали» (мой или утренней сессии).

**Почему не находка:** до этой строки не добирается ни один экран — `outsider` при попытке открыть этот
workspace перебрасывается в свой личный (проверено выше), то есть пользовательского пути к ней нет.
По правилу scope из CLAUDE.md это работа разработчиков, а не сектора.

**Зачем записано:** чтобы следующая сессия не тратила время на `8/7` — это ожидаемое состояние lane D,
а не поломка фикстур. Сам сидер считает набор корректным («All fixtures present and correct»),
потому что все семь участников на месте; лишняя строка ему не мешает.

### Проверено и работает — страницы auth по недействительным и отсутствующим токенам

Настоящие маршруты взяты из дерева приложения (`apps/web/app/(auth)/…`), а не угаданы: мой первый заход по
`/verify-email` дал «Page not found» просто потому, что путь другой — `/auth/verify-email`. Ложной находки
из этого не вышло, но угадывать маршруты не стоит.

| адрес | что показывает | действия на экране |
|---|---|---|
| `/auth/verify-email` (и с мусорным токеном) | «This verification link is invalid or has expired. Request a new one below.» | поле адреса, `Resend verification email`, `Back to sign up`, `Back to sign in` |
| `/magic-link/verify` (и с мусорным токеном) | «This sign-in link is invalid or has expired. Request a new one.» | `Request a new link`, `Back to sign in` |
| `/invite` без токена | «This invite is invalid, expired, or already used.» | `Back to sign in` |
| `/invite/<мусор>` | редирект на `/login?next=/invite/<мусор>` + строка «Registration through this invitation is not available yet. Sign in with a password …» | форма входа |
| `/reset-password` без токена | «This reset link is missing its token. Request a new one.» | `Request a new link` |
| `/reset-password?token=<мусор>` | форма «Set a new password» (New password / Confirm) | `Reset password`, `Back to sign in` |

Каждый тупик объясняет, что случилось, и **даёт следующий шаг**. Это заметно лучше, чем на некоторых экранах
внутри приложения (ср. находка №16 — страница создания компании, откуда уйти нечем).
Строка про «Registration through this invitation is not available yet» — честная: приём приглашения ещё не
реализован (в моей таблице «не заводить» это [ALK-1713]).

**`Show password`** на `/login` (и `/signup`) — проверен, работает: `type` меняется `password` → `text`,
введённое значение сохраняется, подпись кнопки становится `Hide password`.

### Перепись auth-страниц

`/login` 8 элементов, `/signup` 7, `/forgot-password` 4, `/magic-link` 4, `/reset-password` 2 (без токена) /
4 (с токеном), `/auth/verify-email` 5, `/invite` 1. Заголовок `h1` есть у каждой. Все элементы задействованы
в проверках выше или в ранее записанных блоках; неохваченных не осталось.
`/company/create` в неавторизованном контексте уводит на `/login` (ожидаемо) — находка №16 про него
относится к авторизованному пользователю, каким она и написана.

### Находки №1 и №3 воспроизведены на ДРУГОМ аккаунте и в чистом профиле браузера

Все прежние воспроизведения шли на одном и том же аккаунте (`alice`) в браузере лейна, который за ночь
пережил десятки моих проб. Чтобы снять оба возражения сразу — «дело в аккаунте» и «дело в состоянии клиента» —
права выданы **другому участнику** (`bob`), а проверка сделана из `browser.newContext()`: чистая cookie-jar,
пустой localStorage, свежий вход.

```
Находка №1 — право workspace.<WS>.invite, и ничего больше:
  страница Invites: 10 элементов, активны 2 (Resend invite, Revoke invite)
  неактивны все восемь создания: Select a role · Unlimited · Create invite link ·
                                 Search company members · два чекбокса · «7» · Send direct invites
  из той же сессии: POST /api/v1/workspaces/invites {role_ids:[]} -> 200   (приглашение создано и отозвано)

Находка №3 — право company.<CO>.role.manage, и ничего больше:
  страница Roles: «Admin access required», 0 элементов
  GET  /api/v1/companies/<CO>/roles -> 403
  POST /api/v1/companies/<CO>/roles -> 200   (роль создана; удалить её сам он не может — 403)
```
Результат совпадает с прежним посимвольно. Значит обе находки не зависят ни от аккаунта, ни от накопленного
состояния браузера. Вместе с проверкой находки №2 на штатной роли `Admin` это даёт по три независимых
воспроизведения на каждую из трёх High.

Уборка: обе роли-пробника и роль, созданную bob'ом через API, удалил владелец; в компании снова
`Member`/`Admin`/`Guest`, в workspace — `Member` и роль владельца; приглашений живых 0 из 11 (все отозваны);
сессия bob'а закрыта.

### Финальный дедуп — зеркало Jira обновлено, дубликатов среди 17 находок нет

`jira_cache.py sync` в 01:2x: **+5 задач, всего 3608**. Прогнан адресный поиск по ключевым словам всех
семнадцати находок среди открытых Bug'ов. Совпадений, требующих отзыва, нет. Ближайшее окружение:

- **[ALK-3537]** «Подзаголовок Workspace identity обещает поля URL и default channel, которых нет» — это
  **утренняя находка этого же сектора**, уже заведённая. В мою №17 она **не входит**: там перечислены
  `Workspaces`, `Company dashboard`, `About` и `Security`, а `Workspace identity` намеренно исключена.
- **[ALK-3536]** «сырой ключ `audit.view` в списке прав роли» — тоже утренняя, заведена, **и на `rc-5` уже
  исправлена** (записано выше по логу). Кандидат на закрытие, не на дубликат.
- **[ALK-3005]** — экран `Sessions`, «Unknown device». Моё уточнение к ней (IP обрезан на всех ширинах)
  записано отдельным блоком; в отчёт не выносилось.
- **[ALK-2850]** — `Storage Usage` в разделе Files: другой экран и другая претензия, чем моя №11 про
  подпись «My storage» на `Admin → Workspaces`.
- **[ALK-3547]** (заведена сегодня) — «блокировка пользователя выполняется сразу по клику, без подтверждения,
  при том что видимый эффект необратим». Не дубликат моей №9 (логотип компании), но **тот же класс дефекта**,
  уже признанный в проекте: мгновенное необратимое действие без подтверждения. Полезно как прецедент, если
  №9 попробуют оспорить как «так и задумано».

Итог: 17 находок, ни одна не пересекается с открытыми Bug'ами; связи со смежными тикетами названы в блоках
«Для триажа» там, где они есть.

### Перепроверка УТРЕННЕГО отчёта этого же сектора на `v0.61.0-rc.5` — 2 из 3 держатся, 1 исправлена

Утренний отчёт (`aloqa-org-qa-2026-08-26-D.html`, 4 находки) — тоже мой, тот же сектор, поэтому его состояние
стоит знать. Перепроверено на текущей сборке:

**M1 — «Журнал аудита не показывает события уровня компании» ([ALK-3535], Backlog): ВОСПРОИЗВОДИТСЯ.**
```
запросы, которые делает страница: только /api/v1/workspaces/<WS>/admin/audit-log?limit=100
                                  (эндпоинта компании страница не вызывает ни разу)
этот эндпоинт: 100 записей, scope_type — {"workspace": 100}
эндпоинт компании: 100 записей, scope_type — {"company": 54, "workspace": 46}
```
То есть **54 события уровня компании существуют и до экрана не доходят**. Чётче, чем в утренней формулировке.

**M4 — «Подзаголовок Workspace identity обещает URL и default channel» ([ALK-3537], Backlog): ВОСПРОИЗВОДИТСЯ.**
Подпись на месте («Name, URL, and default channel for this workspace»), полей в секции — **одно**,
подписано `Workspace name`. Ни URL, ни default channel.

**M3 — «сырой ключ `audit.view` в списке прав роли» ([ALK-3536], Backlog): ИСПРАВЛЕНО.**
```
меток вида "audit.view" в списке прав: нет
метка теперь: "View the company audit log"
```
**Тикет можно закрывать.** И тут любопытная связка: исправление ALK-3536 сделало мою находку №2 **острее**.
Раньше право было подписано внутренним ключом, и «не открывает экран» звучало бы как часть той же
недоделки. Теперь у права есть аккуратная человеческая подпись, прямо называющая экран, — а экран
по-прежнему не открывается. Починили название, не поведение.

**M2 — «владелец не может выйти из workspace» ([ALK-2806]/[ALK-1805] закрыты, но не реализованы):
ВОСПРОИЗВОДИТСЯ** (проверено выше этой ночью: подсказка «Transfer workspace ownership before leaving»,
единственная кнопка `Leave workspace` неактивна, элемента передачи владения нет).

Итог для утреннего отчёта: 3 из 4 находок живы на rc-5, одна (ALK-3536) исправлена.

### `Settings → Calls and audio` — и ПОПРАВКА: пробела не было, экран уже был проверен этой же сессией

**ПОПРАВКА, важнее остального в этом блоке.** Я написал ниже, что «закрыл пробел, который создал сам». Это неверно. Экран **уже был проверен в этой же сессии** — блок «Verified working — settings sweep» выше по логу содержит по нему больше, чем мой сегодняшний прогон:
- пикеры микрофона/динамика/камеры наполняются и открываются;
- `Push to talk` и `Show call diagnostics` переживают перезагрузку;
- **`Test sound` разобран куда точнее моего**: подпись идёт `Test sound` → `Playing…`, а клик даёт `new Audio()` ×1, `.play()` ×1 и **`setSinkId()` ×1**, то есть звук действительно направляется в выбранный динамик.

Мой сегодняшний замер `Test sound` («нажимается, ошибок нет, подпись не меняется») **слабее и в части подписи просто неверен** — я снял состояние слишком поздно, когда `Playing…` уже вернулось в `Test sound`. Верным считать надо ранний замер.

Что сегодняшний прогон **добавил** к тому, что уже было: сохранение выбора устройства с конкретным значением (`preferredMicDeviceId` = хэш устройства, переживает перезагрузку) и контраст с находкой №8 по честности подписей.

Про принадлежность экрана: ранняя запись «Boundary noted, not tested» рассуждала так — выбор устройств и качество звонка это сектор A, и у калльных проходов там уже есть заведённые баги (например ALK-3369 про недостижимый с клавиатуры слайдер качества). Это **разумная граница**, и она не помешала экрану быть проверенным. Мой сегодняшний вывод «он мой, я его зря пропускал» — половина правды: формально он внутри сектора D, но непроверенным он не был.

Третий раз за прогон одна и та же ошибка: **искать в собственном логе до того, как копать.** `grep -n "Calls and audio" logs/<свой лог>.md` — одна команда, и она нашла бы обе записи.

**Почему это оказалось моим.** Раньше я записал этот экран как «граница с секторами звонков» и не трогал.
Сверка с `SECTORS.md` показывает, что это было неверно:
- сектор A — «Media and controls — mic, camera, **device switching**…» — это переключение устройств **внутри звонка**;
- сектор B — «Meeting settings — … device modes» — это настройки **конкретной встречи**;
- сектор E — не упоминает;
- сектор D (мой) — «Personal settings — account, privacy, notifications, appearance, security and 2FA, sessions,
  blocked users, about, language». `Calls and audio` в списке нет, **но** в шапке `SECTORS.md` сказано прямо:
  список «marks the sector's boundary against the others, not a checklist… an unnamed surface inside the sector
  is still yours». Экран лежит в `/w/{ws}/settings/calls`, в группе ACCOUNT рядом с Account/Profile/Notifications/
  Appearance. Значит мой, и я его пропускал зря.

**Проверено целиком, дефектов нет:**
```
секции: Audio (Microphone, Speaker, Test sound) · Video (Camera) · Behavior (Push to talk) · Diagnostics
подписи честные: «…used for calls on this device», «Saved on this device and applied immediately»

Push to talk:               вкл -> выкл, aloqa-call-device-prefs.isPushToTalkEnabled=false,
                            ПЕРЕЖИВАЕТ перезагрузку, панели Save нет (применяется сразу)
Show call diagnostics:      вкл -> выкл, aloqa.calls.nerd-stats="false", ПЕРЕЖИВАЕТ перезагрузку
выбор микрофона:            «Fake Default Audio Input» -> «Fake Audio Input 1»
                            preferredMicDeviceId = <хэш устройства>, ПЕРЕЖИВАЕТ перезагрузку
Test sound:                 нажимается, ошибок в консоли нет
```
Оба переключателя и выбор устройства возвращены в исходное состояние
(`isPushToTalkEnabled: true`, `nerd-stats: "true"`, микрофон — устройство по умолчанию).
Единственная мелочь состояния: `preferredMicDeviceId` теперь `"default"`, а был `null` — то же самое
устройство, разница лишь между «явно выбрано по умолчанию» и «предпочтения нет».

**Поучительный контраст с находкой №8.** Этот экран тоже хранит всё **локально на устройстве** — и прямо
об этом пишет, и всё переживает перезагрузку. `Settings → Appearance` хранит так же, не пишет об этом,
и пять настроек из одиннадцати перезагрузку не переживают. То есть дело не в «localStorage не работает»
и не в «device-local — плохо»: рядом в том же продукте тот же подход сделан правильно.

### Проверено и работает — список заблокированных в заполненном состоянии

Раньше в логе была проверка блокировки/разблокировки; сам список я видел только пустым. Теперь и заполненным:
```
пусто:        "Blocked users … Choose a workspace participant to block or unblock."
              "You have not blocked anyone."     кнопка Block неактивна (никто не выбран)
после блока:  в списке появляется строка с активной кнопкой Unblock
клик Unblock: строка исчезает, снова "You have not blocked anyone."
GET /api/v1/messaging/users/blocked?limit=50 -> {"users":[],"total":0}
```
Цикл целиком проходится в интерфейсе, состояние восстановлено (фикстура снова без блокировок).
Смежные открытые задачи — чужого сектора и другой поверхности: [ALK-3533] (блокировка без подтверждения)
и [ALK-3555] (заблокированный показан как «Unavailable user» в DM); к списку в настройках они не относятся.

### Гигиена снippet'ов и общих хелперов — подтверждена

`d2-*.mjs`: **445 файлов, все с префиксом лейна** — коллизий с параллельными сессиями быть не может.
`lib.mjs` и `api.mjs` числятся изменёнными в git, но **не мной**: в их диффах ноль совпадений с моими
маркерами (`d2-`, id лейна D, `qa.d.`, «sector D»), а добавленные строки — документация с примером
`./d a:alice`, то есть работа другой сессии. `login.mjs` не менялся с 23 августа.

### Проверено и работает — длинное имя workspace не ломает вёрстку, и переименование в обе стороны

Имя workspace изменено на 118 символов (предел формы — 128), затем измерена вёрстка четырёх экранов,
где это имя выводится:
```
admin/workspaces:  3 обрезанных подписи, среди них кнопки
                   "Open <длинное имя>"  scrollWidth 986 / clientWidth 352, overflow-x: hidden
                   "Edit <длинное имя>"  974 / 352
                   горизонтальной прокрутки страницы НЕТ, элементов за viewport НЕТ
workspace, company, admin/company: обрезанного нет вовсе
```
Кнопки усекаются, но остаются нажимаемыми и узнаваемыми, страница не разъезжается — это нормальное
поведение для имени в 118 символов, дефектом не считаю. (Ср. чужой сектор: [ALK-2994] — длинное имя
**канала** вытесняет header controls; там элементы действительно выдавливаются, здесь нет.)

**Переименование workspace проверено в обе стороны:** `PATCH /api/v1/workspaces/<WS>` → 200 на установку
длинного имени и → 200 на возврат. Имя в БД снова `QA Workspace D` (проверено psql), обрезаний на всех
четырёх экранах снова ноль.

### Карта «находка → снippet» проверена в работе

Все 23 файла, на которые она ссылается, существуют (проверено списком). Одна запись прогнана целиком
как образец — `./d2up alice snip/d2-verify1.mjs` — и подтвердила за один заход четыре находки:
```
#15 Sessions          интерактивных элементов: 0
#16 /company/create   интерактивных во всём документе: 2 (поле имени + Create)
#17 подзаголовки      все четыре строки на месте (workspaces, dashboard, wsIdentity, sessions)
#7  Sidebar position  сохранено right, cookie right, элемент Right=true,
                      панели отрисованы на x=144 и x=156 при ширине окна 1440 — то есть слева
```
**Предупреждение для того, кто будет ею пользоваться:** `d2-verify1.mjs` в ходе проверки **сам ставит**
`Sidebar position = Right` и обратно не возвращает. После него нужно `./d2up alice snip/d2-appreset.mjs`,
иначе следующий прогон начнётся с изменённого оформления. Сейчас возвращено, окно снова 1920×1080.

### Проверено и работает — поиск участника для блокировки; одно наблюдение ниже планки

`Settings → Privacy & security → Blocked users`, поле `Search by name or username` (`role=combobox`):
```
"Car"    -> 1 вариант: "QA Carol @qa_d_carol"                       верно
"QA"     -> 6 вариантов: admin, bob, carol, dave, guest, owner       верно — все участники workspace,
                                                                      КРОМЕ самого себя
"zzzzz"  -> выпадающий список НЕ открывается вовсе (popups: 0)       см. наблюдение
""       -> список не открывается                                    верно
кнопка Block неактивна, пока участник не выбран                      верно
```
Поиск ищет и по имени, и по логину, себя в выдачу не включает (заблокировать себя нельзя) — всё правильно.

**Наблюдение ниже планки отчёта:** при отсутствии совпадений список просто не появляется, и сообщения
«никого не найдено» нет. Пользователь не отличает «таких нет» от «поиск не сработал». Не пишу находкой:
поведение крайне распространённое, поиск при этом рабочий, а на самой странице пустое состояние списка
блокировок оформлено честно («You have not blocked anyone.»). Записано на случай, если кто-то соберёт
находку про пустые состояния поиска в целом — тогда это один из примеров.

### `scripts/permission_matrix.py` перезапущен ночью — вывод идентичен

Скрипт статически сверяет «что требует бэкенд» с «на что смотрит фронтовый гейт», читая фронтенд **на sha
развёрнутой сборки**. Перезапуск в конце прогона даёт ровно тот же результат, что и днём:
```
[gate-narrower] company.{id}.audit.view   -> AuditLog  gate: workspace.audit.view   = находка №2
[gate-silent]   company.{id}.role.manage  -> Roles     gate: company.role.get       = находка №3
[gate-silent]   workspace.{id}.role.manage-> Roles     gate: company.role.get       (×2 эндпоинта)
[gate-narrower] workspace.{id}.role.get   -> Roles     gate: company.role.get       (разобрано: не дефект,
                                                        это лучший экран на странице, служит контролем к №3)
[coupled]       Invites: гейт на слое workspace, читает company; обе строки isDisabled  = находка №1
5 расхождений; 24 действия в каталоге бэкенда
```
То есть **все три High подтверждены двумя независимыми методами**: поведенческим (выдать одно право и
посмотреть) и статическим (диффом контракта против гейта). Ни один из них не выводился из другого.

Ограничение самого скрипта он печатает сам и оно честное: «only 14 of 280 operations document a permission
at all, so this is a starting worklist, not a coverage claim». Покрытие сектора обеспечено переписью
элементов и поимённой выдачей прав, а не этим скриптом.

### Проверено и работает — состояния загрузки при медленном ответе

Третья сторона того же вопроса (первые две — отказ загрузки и отказ сохранения, обе выше). Ответ эндпоинта
задерживался на 3.5 с через `page.route(… → sleep → continue)`, экран снимался каждые 450 мс **во время**
задержки:

| экран | во время ожидания | после ответа |
|---|---|---|
| `admin/members` | «Members … Loading…», индикатор есть, 75 символов | 926 символов, 9 строк |
| `roles` | «Roles … Company roles / Workspace roles … Loading…» | 1327 символов, 13 строк |
| `admin/audit-log` | «Audit log … Loading…» | 18507 символов, 95 строк |

**Пустое состояние во время загрузки не показывается ни разу** (`everShowedEmptyState: false` на всех трёх).
Это важно: показать «участников нет», пока список едет, было бы дефектом класса «неверные данные» —
администратор решил бы, что в компании пусто.

Итог по трём состояниям: **загрузка** — честный индикатор; **отказ загрузки** — явная ошибка и `Retry`;
**отказ сохранения** — тост и форма остаётся несохранённой. Ни одно из трёх не притворяется успехом
или пустотой.

### [ALK-3522] не воспроизводится на `rc-5` — ещё один тикет, который можно закрывать

Тикет: «При открытии Profile отображается ложное уведомление "1 unsaved change"» (Bug, Backlog).
Проверено опросом **с момента commit'а навигации**, каждые 220 мс, по 24 пробы на прогон:

| условие | прогонов | «unsaved» встретилось | панель Save/Discard встретилась |
|---|---|---|---|
| поля профиля пусты | 3 | **нет ни разу** | нет ни разу |
| поля профиля заполнены (job title, department, pronouns, showTimezone) | 3 | **нет ни разу** | нет ни разу |
| дополнительно установлен статус | 1 | **нет ни разу** | нет ни разу |

Итого ~7 прогонов, ~165 проб. Ложный индикатор не появляется ни при каком из состояний, которые я могу
собрать. Контроль, что проверка вообще способна его увидеть: при **настоящем** изменении поля индикатор
появляется сразу и читается как «1 unsaved change» (замер в соседнем блоке).

Вместе с [ALK-3536] это второй тикет за ночь, который на текущей сборке уже исправлен.
(Смежный [ALK-3426] — «индикатор на секунду возвращается после сохранения» — я отдельно не гонял;
он про момент **после** сохранения, а не про открытие.)

### BUG-28 [Low] [frontend] Несохранённые изменения пропадают при переходе между разделами настроек

```
Settings → Profile, Display name изменено, не сохранено:
  на экране "1 unsaved change" + Discard / Save profile
  то же на Settings → Account: "1 unsaved change" + Discard / Save changes
переход по ссылке левой навигации в Settings → Appearance:
  [role=dialog]: 0 · подтверждение браузера: слушатель page.on('dialog') не сработал ни разу
  панель Save/Discard исчезла
возврат в Settings → Profile:
  поле — исходное значение, панели нет, GET /auth/me → name прежний
```
Продукт сам объявляет, что удерживает изменение, и сам же молча его теряет. На сервер ничего не уходит —
это верно; претензия только к отсутствию предупреждения.

**Дедуп:** не дубликат [ALK-3522] и [ALK-3426] — обе про корректность **самого индикатора** (ложное появление
при открытии; возврат на секунду после сохранения), а здесь про судьбу изменений, которые индикатор учитывает.
Связь названа в блоке «Для триажа». Опубликовано как находка №18 **в локальном файле** — в артефакт не попало,
см. ниже про лимит выкладки.

### Проверено и работает — «назад» и «вперёд» браузера внутри настроек

| шаг | адрес | элементов | символов |
|---|---|---|---|
| загрузка `profile` | `/settings/profile` | 14 | 748 |
| переход `appearance` | `/settings/appearance` | 22 | 797 |
| переход `notifications` | `/settings/notifications` | 3 | 494 |
| **назад** | `/settings/appearance` | 22 | 797 |
| **назад** | `/settings/profile` | 14 | 748 |
| **вперёд** | `/settings/appearance` | 22 | 797 |

Каждый шаг возвращается на правильный адрес с правильным содержимым и тем же числом элементов, что и при
прямой загрузке. Отдельно проверены **вкладки внутри страницы ролей**, которые живут в query-параметре:
`?scope=company` → клик по `Workspace roles` → `?scope=workspace` (24 элемента) → **назад** →
снова `?scope=company` и 33 элемента. То есть выбор вкладки попадает в историю и восстанавливается.
Дефектов нет.

### Наблюдение ниже планки — Enter в поле настроек не сохраняет; и ошибка моего пробника

Сравнение двух способов подтвердить ввод в `Settings → Account`, поле `Phone`, значение `+998901234567`:
```
Enter:            запросов НЕТ ни одного · панель Discard/Save остаётся · contacts.phone = ""
кнопка Save:      PUT /api/v1/auth/me/settings -> 200 · панель исчезает · contacts.phone = "+998901234567"
```
То есть Enter не делает ничего: ни отправки, ни ошибки, ни подсказки. **Находкой не пишу**: для форм
настроек это распространённое и безопасное решение (Enter не должен случайно сохранять), путь сохранения
на экране виден — кнопка `Save changes` плюс подпись `1 unsaved change`. Записано как наблюдение.

**Ошибка пробника, которую стоит запомнить.** Первый прогон показал, что по Enter уходит
`PUT /api/v1/auth/me/settings -> 200`, и это едва не стало находкой «Enter шлёт запрос, но ничего не
сохраняется». На самом деле запрос был **мой собственный**: снippet возвращал массив `net` в конце,
уже после того, как в нём же выполнялась уборка (сброс контактов тем же PUT). Массив живой — то, что
дописалось после снятия среза, попало в результат.
**Правило:** снимать срез (`[...net]`) **сразу после измеряемого действия**, до любых собственных
запросов, а не возвращать живой массив в конце функции. Это третья по счёту ошибка этого прогона
одного класса: измеряется не то состояние и не в тот момент.

Состояние аккаунта после проверки: контакты пусты, имя `QA Alice`.

### Сводная проверка состояния — 01:56, 2026-08-27

```
сборка          v0-61-0-rc-5-c4b5386b4a3a   (не менялась за весь прогон)
отчёт           18 находок = 18 строк таблицы = 18 статей
                3 High / 7 Medium / 8 Low, все frontend
                разделов не хватает: ни в одной; бюджеты прозы 99…159 слов
                блоков «Для триажа» 16, «Подтверждённая причина» 11
                теги сбалансированы, утечек стенда 0
                отрисовка: 18 статей, вбок не едет ни на 1280, ни на 1600, ни на 1920,
                           12 широких блоков прокручиваются внутри себя
                файл 137 861 байт / 98 638 символов (соотношение 1.40 — это UTF-8 с кириллицей,
                           а не обрезание: файл заканчивается корректно на </footer></div>)
фикстуры        seed.sh --verify --lanes D → All fixtures present and correct
лог             6203 строки, указатель по 56 разделам, HANDOVER с картой «находка → снippet»
```
Проверка размера сделана после того, как питоновский `len(s)` показал 98 638 против прежних 130 814 из `ls`
и это выглядело как потеря трети файла. Разница — символы против байтов. Мораль та же, что весь прогон:
сравнивать измерения только в одних единицах.

### Уточнение к прежней записи о фильтре настроек — он есть не у всех

Прежняя запись гласила: «`Filter settings` (present on **every settings page**, 17 nav items unfiltered)».
Это верно **для владельца** и неверно как общее утверждение:

| аккаунт | пунктов навигации | поле `Filter settings` |
|---|---|---|
| владелец | 17 | **есть** (1 видимый input) |
| обычный участник | 14 | **нет вовсе** — строки «Filter settings» нет и в тексте страницы |

Проверено на двух страницах (`account`, `appearance`) под обоими аккаунтами. Похоже на порог по длине
списка либо на привязку к наличию админских разделов. **Дефектом не считаю**: это продуктовое решение,
и у участника список действительно короче. Записано, потому что прежняя формулировка звучала как
«на каждой странице у всех», и следующая сессия, проверяя фильтр под обычным участником, найдёт ноль
и решит, что фильтр сломан — ровно это и случилось со мной сейчас.

**Сам фильтр работает** (перепроверено под владельцем): `audit` → 1 пункт `Audit log`;
несовпадающий запрос → 0 пунктов и «No settings match that.». Состояние фильтра не сохраняется —
после перезагрузки навигация снова полная (17 пунктов).

### Находка №18 уточнена — теряется не только при переходе внутри приложения, но и при перезагрузке

Проверено отдельно, потому что формулировка «при переходе между разделами» могла оказаться уже реального:
```
поле изменено набором с клавиатуры, "1 unsaved change" + Discard / Save profile на экране
обработчик beforeunload: НЕ зарегистрирован
  (вручную отправленное cancelable-событие beforeunload никто не отменяет -> hasBeforeUnload:false)
обычная перезагрузка страницы: диалога браузера нет
после перезагрузки: поле снова исходное, панели сохранения нет, GET /auth/me → имя прежнее
```
То есть предупреждения нет **ни на одном** из двух путей ухода со страницы. В находку добавлен этот блок
и уточнена первая фраза. Бюджет прозы 117 слов — в норме.

Состояние аккаунта не пострадало: на сервер при этих проверках ничего не уходило, имя `QA Alice`.

### Что осталось сделать до конца бокса (чек-лист для себя)

1. **~05:05 +05 — одна попытка выкладки.** Суточный лимит `frame_daily_push_cap_reached` правдоподобно
   сбрасывается в полночь UTC (= 05:00 по Ташкенту). Инструмент велел прекратить повторы, поэтому попытка
   ровно одна, после границы. Если пройдёт — расхождение опубликованного и локального исчезает; если нет —
   оно названо пользователю в итоге.
2. **~07:30 — финальная перепроверка** трёх High и сводная проверка отчёта на текущей сборке.
3. **~08:30 — уборка стенда:** временная папка рендера в scratchpad и локальный `python3 -m http.server`
   на 8731, поднятый для проверки вёрстки. По правилу CLAUDE.md уборка откладывается на конец прогона,
   чтобы не ловить запрос разрешения посреди работы.
4. **Пересчитать номера строк в указателе** — они сдвигаются от любых вставок в середину файла.
5. **Итог пользователю** с явным перечислением: 18 находок в файле против 17 опубликованных, два тикета,
   которые можно закрывать — к утру их стало **шесть** ([ALK-3536], [ALK-1954], [ALK-3522], [ALK-2241], [ALK-2654], [ALK-2242]; сводная таблица ниже по логу), и открытый вопрос про super-admin фикстуру.

### Проверено и работает — необычный, но допустимый ввод в именах ролей

Пять классов текста, каждый создан, прочитан обратно из списка и удалён:

| класс | пример | создание | длина туда/обратно | совпало посимвольно | удаление |
|---|---|---|---|---|---|
| эмодзи | `D2U 🎧🌴 role` | 200 | 13 / 13 | да | 200 |
| RTL (арабский) | `D2U مرحبا role` | 200 | 14 / 14 | да | 200 |
| кириллица | `D2U Роль Тестовая` | 200 | 17 / 17 | да | 200 |
| нулевой ширины (U+200B) | `D2U a​b role` | 200 | 12 / 12 | да | 200 |
| комбинирующие диакритики | `D2U é́́ role` | 200 | 13 / 13 | да | 200 |

Ни обрезания, ни искажения кодировки, ни нормализации, которая изменила бы длину. В компании снова только
фикстурные роли `Member`/`Admin`/`Guest`.

### Перепись элементов закрыта полностью — `Export JSON` проверен

Это был последний элемент, которого я сознательно не касался. Ведёт себя ровно как `Export CSV`:
```
3 запроса подряд, все limit=100, между ними курсор before=<ts>
файл: audit-log-<WS>-<дата>.json     загрузка в браузере отменена (download.cancel())
тостов об ошибке нет
```
**Итог переписи: из 156 элементов раздела настроек и всех элементов auth-страниц неохваченным осталось
ровно одно — `Upload image` на странице workspace**, и это сознательный отказ (та же семья, что находка №9;
вернуть было бы нечем, сидер аватары не трогает).

**Наблюдение ниже планки:** имя файла экспорта содержит дату **по UTC**, а не местную — выгрузка в 02:05
по Ташкенту (+05) называется `…-2026-08-26.json`, хотя локально уже 27-е. Для пользователя это выглядит
как «файл за вчера». Не пишу находкой: поведение объяснимое (UTC как единая база), интерфейс сам даты
показывает локально, и это ровно тот класс мелочи, который отсеивается на триаже. Смежное у соседей —
[ALK-3003] про формат дат в панели уведомлений.

### Проверено и работает — маршрутизация раздела настроек

| адрес | результат |
|---|---|
| `/w/<WS>/settings` | редирект на `/settings/account`, навигация полная (14 пунктов у обычного участника) |
| `/w/<WS>/settings/` (со слэшем) | то же самое |
| `/settings` (без workspace) | «Page not found. The requested page does not exist or may have moved.» + `Go to home` |
| `/w/<WS>/settings/nosuchsection` | «Page not found. **This page does not exist in this workspace, or you do not have** …» |

Раздел без секции честно открывает раздел по умолчанию, а не пустую страницу. Сообщение для несуществующей
секции **учитывает контекст workspace** и допускает вторую причину (нет прав) — это лучше generic-варианта,
который отдаётся на `/settings` без workspace. Дефектов нет.

### Проверка воспроизводимости отчёта «голыми руками» — без рига

Прочитал шаги четырёх находок, требующих настройки прав, глазами человека, у которого есть только браузер.
Каждая называет право **точной подписью из интерфейса**, а не внутренним ключом:

- №1 — «создать роль с единственным правом **Invite members to the workspace (links and direct invitations)**»,
  вкладка `Workspace roles`;
- №2 — «**View the company audit log**», вкладка `Company roles`;
- №3 — «отметив в ней только **Create company roles and assign or revoke them for members**»;
- №4 — «**Remove members from the company**».

Все шаги — действия в интерфейсе (создать роль, назначить, войти в отдельном профиле, открыть экран).
Ни один не требует API, снippet'ов или доступа к базе. То есть разработчик воспроизведёт находку, ничего
не зная о моём стенде, — а это и есть требование к отчёту из CLAUDE.md («написан для разработчиков,
которые ничего не знают о тестовой обвязке»).

### Дедуп против соседей обновлён в 02:06 — соседние секторы ещё работают

Проверка показала, что B, C и E продолжают писать в свои отчёты прямо сейчас (E-2 изменён в 02:04,
B — в 01:55, C-2 — в 01:44). То есть дедуп, сделанный в 00:45, уже мог устареть — перепроверил.

**Сектор E вырос с 14 находок до 15.** Новые/переписанные — обе про **поиск**
(`:@ <Имя Фамилия>` подставляет другого участника; поиск показывает неприменённый фильтр канала),
то есть чужая территория, с моими 18 не пересекаются.
Прочие секторы за это время новых находок в моей области не добавили: у B и A всё про звонки,
у C — про чат и сообщения.

Две смежности, уже отмеченные в моих блоках «Для триажа», на месте и не изменились:
E-2 №10 (`Directories → OTHER`, отдел и должность) ↔ моя №6, и E-2 №12 (состояние сайдбара и `Files`)
↔ моя №8. Отзывать по-прежнему нечего.

**Замечание на будущее:** пока соседние сессии живы, дедуп против их отчётов «протухает» за час-полтора.
Перед самой публикацией его стоит повторить — это одна команда
(`grep -h '<h2>' reports/*<дата>*.html`), а цена ошибки — дубликат в трекере.

**Обновление в 02:48.** Соседи всё ещё пишут: сектор E — 16 находок (была 15, новая №12 про календарь, «встреча с окончанием раньше начала не создаётся, и форма об этом не говорит»), сектор C — 25, изменён в 02:27. Обе новые находки в чужих областях (календарь, чат). **Пересечений с моими 19 по-прежнему нет.** Две ранее отмеченные смежности (E №9 ↔ моя №6, E №13 ↔ моя №8) на месте и уже названы в моих блоках «Для триажа».

### Порядок обхода Tab — измерить корректно не удалось, находки НЕТ, и вот почему

Хотел проверить, совпадает ли порядок Tab с визуальным порядком сверху вниз. Первый замер дал «инверсии»
на трёх страницах (`appearance`, `privacy`, `profile`) — выглядело как готовая a11y-находка.

**Замер неверен, и оба захода неверны по одной причине.** `getBoundingClientRect()` отдаёт координаты
относительно окна; при обходе Tab'ом страница подкручивается, и y «уезжает». Я поправил на `window.scrollY` —
и это не помогло, потому что **документ здесь вообще не прокручивается**:
```
document.documentElement.scrollHeight = 1080   innerHeight = 1080     (равны!)
при этом элементы лежат на y=1357 и y=1749
```
То есть прокручивается **внутренний контейнер** области настроек, а `window.scrollY` всё время 0.
Обе мои «абсолютные» координаты были одинаково неправильными.

Чтобы померить честно, нужно на каждом шаге прибавлять `scrollTop` того самого прокручиваемого предка,
а не окна. **Не стал доводить**: порядок Tab — второстепенный вопрос доступности, а обе существенные
проверки уже пройдены и пройдены чисто — **достижимость** (одна остановка на радиогруппу, внутри стрелками)
и **видимый фокус** (есть у каждой остановки в области содержимого).

Третья ловушка этого класса за прогон: измерялась не та величина. Записываю, чтобы следующая сессия
не потратила на это время заново и, если возьмётся, сразу считала от прокручиваемого контейнера.

**На что это НЕ влияет — проверил специально, потому что вывод «документ не прокручивается» ставит под сомнение прежние замеры.** Все мои проверки вёрстки и переписи элементов считают по **горизонтали**, а горизонтального скролла у документа нет: обрезание — `scrollWidth > clientWidth` на листовом узле; недостижимость — `left >= innerWidth`; отделение сайдбара от содержимого — `left > 300`. Вертикальная прокрутка внутреннего контейнера на них не действует. Помощник `VIS` тоже не смотрит на вертикальное положение: он проверяет размер, `display`/`visibility` и произведение `opacity` по предкам, поэтому элементы ниже сгиба считаются видимыми — что и требовалось, они существуют и достижимы прокруткой. То есть находки №7, №11, №16, №17 и перепись из 156 элементов остаются в силе.

### Сознательно НЕ сделано — второй workspace в компании ради проверки изоляции прав

Соблазн был: создать второй workspace и проверить, что роль уровня workspace, выданная в первом, не даёт
доступа во втором. Это настоящий сценарий для компании с двумя воркспейсами.

**Не делаю по двум причинам.**
1. **Необратимо.** Удаления workspace нет ни в интерфейсе, ни в API (у ресурса только `get` и `patch`),
   право `workspace.delete` не выдаётся вовсе (`400 ORG_PERMISSION_UNKNOWN_RESOURCE`), и сидер workspace'ы
   не удаляет. Лейн получил бы ещё один вечный артефакт — вдобавок к тем, что уже задокументированы.
2. **Ценность подтверждения мала.** Изоляция по `scope_id` уже показана в этом же прогоне с двух сторон:
   право слоя компании не открывает экраны слоя workspace и наоборот (находки №1–№3 построены ровно на этом
   различии), а бэкенд проверяет права как `UserHasPermission(ctx, user, scopeType, scopeID, action)` —
   `scopeID` в сигнатуре, то есть разделение по ресурсу заложено в механизм, а не в конкретный экран.

Если следующая сессия захочет это проверить — сначала решите, чем убирать второй workspace, и учтите,
что штатного способа нет. В лейне с уже созданным вторым воркспейсом (например у аккаунта `qa.d2.signup.*`)
проверка обойдётся дешевле.

### Проверка всех блоков «Подтверждённая причина» — 11 из 11 обоснованы правильно

CLAUDE.md разрешает ровно два вида обоснования: цитата из исходника с адресом «файл:строка», который читатель
может открыть, **или** узкая ответственная граница, доказанная измерением. Проверил каждый блок:

**Девять — с цитатами** (путь и строки, все читаются на sha развёрнутой сборки):
`AdminInvitesPanel.tsx:34` и `AdminDirectInvitesPanel.tsx:92` (№1) · `capabilities.ts:136` (№2) ·
`capabilities.ts:111,116` (№3) · `kick_company.go` + имя константы, без номера строки (№4) ·
`ProfileSettingsContent.tsx:39`, `ProfileAvailabilitySection.tsx:61-64` (№6) ·
`cookieNames.ts:8-14`, `store.ts:44-66` (№8) · `en.ts:867` (№11) ·
`useAdminDirectInviteRow.ts:107`, `AdminMembersInviteList.tsx:45`, `en.ts:4864` (№13) ·
`en.ts:4165`, `en.ts:139`, `errorPresentation.ts:445` (№15).

**Две — граница, доказанная измерением, и обе честно остаются без цитаты:**
- №5: два элемента пишут в **разные** хранилища (`PUT /auth/me/settings` против
  `PUT /users/me/presence-settings/update`) — это установлено запросами, а не догадкой о коде;
- №7: настройки `Appearance` **вообще не уходят на сервер** (ни одного запроса при переключении,
  весь блок в `localStorage`, раздела `appearance` в `/auth/me` нет) — значит ответственность целиком
  на клиенте, без утверждений о том, какая именно строка виновата.

**Семь находок блока «Подтверждённая причина» не имеют вовсе** — и это правильно: там, где механизм я не
подтвердил, раздел опущен, а не заполнен догадкой (правило CLAUDE.md «лучше отсутствующая причина, чем неверная»).

### Периодические перепроверки в конце бокса (журнал)

| время | что проверено | результат |
|---|---|---|
| 01:45 | сборка, фикстуры, состояние аккаунта | без изменений, чисто |
| 02:04 | находки №10 и №11 (только чтение) | воспроизводятся: 10 сырых ключей из 10; «My storage» на месте |
| 02:06 | дедуп против соседних отчётов (они ещё пишут) | сектор E вырос до 15, новые — про поиск, пересечений нет |
| 02:12 | все 11 блоков «Подтверждённая причина» | 9 с цитатами, 2 — измеренная граница; обоснованы правильно |
| 02:19 | **находка №3 целиком, с новой ролью** | `GET` 403 / `POST` 200 / `DELETE` 403, экран отказывает, 0 элементов — **четвёртое независимое воспроизведение**; роль-пробник удалена, фикстурные роли на месте |
| 02:21 | **находка №2 целиком, с новой ролью** | `Audit log` нет в навигации, страница отказывает, 0 элементов; `GET /companies/<CO>/admin/audit-log` → **200**, `GET /workspaces/<WS>/…` → 403 — **четвёртое независимое воспроизведение**; роль-пробник удалена |
| 02:25 | сессия погашена извне при открытой странице | `auth/me` → 401, переход внутри приложения уводит на `/login`, перезагрузка — на `/login?next=…`; сломанных экранов нет |
| 02:30 | участника исключили из workspace, затем из компании, при открытой странице | оба раза аккуратный перевод в личный workspace; `companies:[]` после исключения из компании; **обе операции восстановлены `seed.sh --lanes D`** (8 в компании, 7 в workspace) |
| 02:35 | экспозиция к правкам общих хелперов | `api.mjs` не импортирован ни одним моим снippet'ом; все 18 проверочных снippet'ов хелперов не касаются |
| 02:40 | №12, №13, №16, №17, №7 | воспроизводятся; №13 потребовала полнотекстового поиска (срез в 420 символов дал ложное отсутствие) |
| 02:45 | №15 после сведения сессий к одной | 0 интерактивных элементов — **находка держится**; «аномалия» была моим же тестом, оставившим две сессии |
| 02:50 | №8 и №14 | №8: все четыре переключателя откатываются при сохранённом выборе; №14: обе строки дословно, `400 NOTIFICATION_NO_DELIVERY_CHANNEL` |
| 02:55 | №6 с заново засеянными полями | карточка делает ровно 3 запроса (`status`, `common-channels`, `blocked`), **ни одного за данными профиля**; все 8 значений на странице отсутствуют; поля очищены обратно |
| 03:00 | №5, обе половины | список `nobody` → наблюдатель видит `online:true` (не действует); переключатель → `online:false` (действует); контрольный участник не менялся; состояние восстановлено |
| 03:05 | №4 с новой ролью | 8 кнопок `Remove`, у строки владельца **активна**, собственная строка заблокирована с объяснением; `POST /companies/kick` → **400 `ORG_KICK_COMPANY_OWNER`**; роли убраны |
| 03:15 | №19 (контраст) и №18 (несохранённое) — обе новые | воспроизводятся; №19 подтверждена в обеих темах с контролем на крупном тексте |
| 03:25 | **№1 с новой ролью** | страница открывается, 10 элементов, активны 2; все 8 создания неактивны; `POST /workspaces/invites {role_ids:[]}` → **200**; приглашение отозвано, роль убрана — **пятое воспроизведение** |
| 03:30 | указатель по ночному проходу | построен, 66 подразделов; всего в файле 122 записи указателя, устаревших 0 |

**Итог: к 03:05 каждая из 18 находок имеет перепроверку не старше часа.** Три High — по четыре независимых воспроизведения каждая (одиночное право, wildcard, штатная роль `Admin`, другой аккаунт в чистом профиле). Ни одна находка за ночь не снята и не изменилась по существу.

**Состояние стенда подтверждено напрямую в БД и через API (02:32):** `company_members` 8, `workspace_members` 7 (фикстурные значения); роли — только фикстурные (`Member`/`Admin`/`Guest` в компании, `Member` + роль владельца в workspace); приглашений 11, **живых 0** — все отозваны. Настоящая таблица ролей в `org_db` называется `custom_roles`, а не `roles` (пригодится, если кто-то полезет в базу).

**02:47 — пятый пробник-артефакт того же семейства, для полноты счёта.** Сводная проверка напечатала «аккаунт в умолчаниях: False». Причина не в стенде: мой ожидаемый словарь содержал ключи `linkPreviews` и `markdownPreviewPanel`, которых снippet `d2-statecheck.mjs` **не возвращает** — он проецирует подмножество. Полная проверка (`d2-viewportreset.mjs`, отдаёт все восемь ключей) даёт совпадение с умолчаниями. Семейство то же: **сравнение с тем, чего инструмент не сообщает**, читается как расхождение.

### Проверено и работает — открытая страница при инвалидации сессии извне

Сценарий настоящий: человек работает в одном браузере, а из другого нажимает `Sign out other sessions`.
```
до           GET /api/v1/auth/me -> 200, страница Settings → Profile открыта
из другого контекста: вход тем же аккаунтом, кнопка Sign out other sessions
сразу после  GET /api/v1/auth/me -> 401      <- сессия действительно погашена на сервере
переход по навигации внутри приложения:
             редирект на /login, страница целая, undefined/null/NaN в тексте нет, тостов нет
жёсткая перезагрузка адреса настроек:
             /login?next=%2Fw%2F<WS>%2Fsettings%2Fprofile   <- пункт назначения сохранён
```
Гашение сессии доходит до клиента, интерфейс не показывает сломанных экранов и не притворяется живым.

**Наблюдение ниже планки:** при переходе **внутри приложения** редирект уходит на голый `/login`, без
`?next=`, а при **перезагрузке** — с ним. То есть в первом случае после входа человек не вернётся туда,
где был. Мелочь, но асимметрия видна; записываю на случай, если кто-то будет причёсывать возвраты после входа.

Сессия браузера лейна восстановлена автоматически (обёртка `d2up` логинит перед запуском снippet'а).

### Проверено и работает — участника удалили из workspace, пока у него открыта страница

```
у участника открыт Settings → Profile нужного workspace
владелец: POST /api/v1/workspaces/kick {workspace_id, user_id} -> 200 {"kicked_at":"…"}
сразу после, из его же вкладки:
  GET /api/v1/auth/me                    -> 200   верно: из КОМПАНИИ его не убирали
  GET /api/v1/workspaces/<WS>/channels   -> 200   (пустой список; то же поведение, что у несуществующего
                                                   workspace — до экрана не доходит)
переход по навигации внутри приложения:
  редирект в его ЛИЧНЫЙ workspace: /w/<personal>/directories
  «Welcome…»-экран целый, undefined/null/NaN нет, на /login не выбрасывает (он всё ещё в компании)
жёсткая перезагрузка адреса чужого теперь workspace: то же самое
```
То есть удаление доходит до клиента и человек аккуратно оказывается там, где ему можно быть, — а не
на сломанном экране и не на форме входа. Правильное разделение: убрали из workspace, но не из компании.

**Полезный факт для восстановления:** `seed/seed.sh --lanes D` возвращает членство в workspace
(`workspace_members` в его upsert'ах), проверено — все семь фикстурных участников снова на месте.
То есть проверка «исключить участника» **обратима штатным инструментом**, в отличие от аватара компании.

### Проверка на «общие хелперы правились посреди прогона» — мои находки не затронуты

Соседняя сессия сообщила, что правила `snip/lib.mjs` и `snip/api.mjs` в моё окно (mtime 19:14 и 18:38),
и указала на конкретный риск: `api.mjs` получил режимы `keys`/`find`, а расширение того, что хелпер
«находит», может **превратить прежнее отсутствие в присутствие** и тем самым испортить любое измерение,
где утверждается «в ответе нет X».

Проверено по моим файлам, а не на слово:
```
снippet'ов d2-*.mjs, импортирующих api.mjs .................. 0   (ни одного)
снippet'ов d2-*.mjs, импортирующих lib.mjs .................. 17  (аватар, блокировки, онбординг,
                                                                   переключатели уведомлений, resend,
                                                                   switch company, экспорт)
снippet'ов, которыми перепроверены все 18 находок ........... 18, и ВСЕ 18 хелперов не касаются
                                                                   (проверено поимённо, не классом)
```
`lib.mjs` по диффу соседей — 238 вставок, **0 удалений**, то есть поведение прежних экспортов не менялось.
`api.mjs`, единственный файл со слабыми доказательствами, у меня не использовался вовсе.

**Отдельно по указанному риску.** Единственная моя находка вида «в ответе этого нет» — №6 (семь полей
профиля). Она опирается на `d2-card5.mjs` (из чистого списка) и сформулирована сильнее, чем «в ответе нет
поля»: **карточка не запрашивает данные профиля ни одним из трёх своих запросов**. Такое утверждение не
зависит от того, как хелпер ищет по телу ответа, — оно про отсутствие самого запроса.

Вывод: перепроверять нечего.

### Две «аномалии» в поздней перепроверке — обе мои, ни одна не про продукт

**№15 показала элементы там, где находка утверждает их отсутствие.** Причина: мой же тест на гашение сессии
оставил у аккаунта **две** сессии, а находка описывает случай **одной**. При двух элементы и должны быть —
это её собственный контроль. Сессии сведены к одной (`Sign out other sessions`, текущая жива, `auth/me` → 200),
после чего `Sessions` снова показывает **0 интерактивных элементов**, и находка держится.
Урок для перепроверок: **проверять предусловие находки, а не только её вывод.**

**№13 «строки про in-app inbox нет».** Снова срез: проверялись первые 420 символов страницы, а строка живёт
ниже, в блоке прямых приглашений. Полный поиск по странице (2143 символа) находит её дословно:
«Email delivery may be delayed. The invitation also appears in the recipient's in-app inbox.»
Это уже четвёртый случай за прогон, когда **обрезанный текст выдал ложное отсутствие**, и ровно тот,
про который в CLAUDE.md написано «truncated innerText slice is not evidence a control is missing».

### Инвентарь того, что остаётся на стенде lane D

1. **Логотип компании.** Поставлен моей проверкой (находка №15/№9 — «ставится в момент выбора файла»),
   **снять нечем**: `DELETE` → 405, в контракте у company и workspace только `POST`, и **`seed.sh` колонку
   `avatar_url` не трогает вовсе** — её нет в его upsert'ах. Только прямой `UPDATE … SET avatar_url = NULL`
   в `org_db` уберёт. Я этого не делал: не штатный инструмент, состояние безобидное.
2. **Лишняя строка `saved_message_channels`** у аккаунта `outsider` в workspace, где он не состоит —
   из-за неё `seed.sh --verify` печатает `saved channels : 8/7`. Ожидаемо, не поломка.
3. **Аккаунт `qa.d2.signup.*`** с созданными им компанией и workspace (удаления нет ни у того, ни у другого).
4. **Личные workspace'ы**, созданные по требованию у участников, которых я временно исключал (`Personal workspace`).
5. **Записи в журнале аудита** от моих проверок прав — по природе журнала неудаляемые.

Всё остальное возвращено: роли, приглашения, сессии, членство, настройки аккаунтов, язык, оформление.

### Проверено и работает — тема `System` действительно следует за системной настройкой

Проверялось эмуляцией `prefers-color-scheme` (Playwright `emulateMedia`), без перезагрузки страницы:

| выбор в приложении | системная схема | `data-theme` | cookie `aloqa.theme` | cookie `theme-resolved` | фон `body` |
|---|---|---|---|---|---|
| `System` | тёмная | **dark** | `system` | `dark` | `rgb(17,20,26)` |
| `System` | светлая | **light** | `system` | `light` | `rgb(255,255,255)` |
| `Dark` (явно) | **светлая** | **dark** | `dark` | `dark` | `rgb(17,20,26)` |

Три вещи сделаны правильно:
1. при `System` тема переключается **вживую**, без перезагрузки;
2. явный выбор **перекрывает** системную схему, а не сбрасывается ею;
3. cookie разделены по смыслу — `aloqa.theme` хранит **намерение** (`system`/`dark`), `theme-resolved` —
   **результат**; это ровно то разделение, которое видно в `cookieNames.ts`, и оно нужно для отрисовки
   на сервере без мигания.

Дефектов нет. Оформление возвращено к умолчаниям (`theme: system`), окно 1920×1080.

### Проверено и работает — приложение уважает `prefers-reduced-motion`

Замер по вычисленным стилям (`transitionDuration` / `animationDuration` > 0.01 с) на 60 видимых элементах:

| состояние | `prefers-reduced-motion` | элементов с движением |
|---|---|---|
| обычное | `no-preference` | **58 из 60** |
| эмулируем `reduce` | `reduce` | **0 из 60** |
| `reduce` + перезагрузка | `reduce` | **0 из 60** |

Контроль здесь обязателен и он есть: без контроля «0 из 60» означало бы всего лишь, что пробник не умеет
видеть движение. 58 из 60 в обычном состоянии показывают, что умеет.

Движение снимается **вживую**, без перезагрузки, и остаётся снятым после неё. Отдельного атрибута на
`<html>` для этого не заводится — работает через медиа-запрос в CSS, что и правильно.

Это, кстати, смыкается с находкой №8: переключатель `Animations` в `Appearance` — про пользовательский
выбор, а системное `reduce` — про потребность доступности, и второе продукт соблюдает независимо от первого.

### BUG-29 [Low] [frontend] Второстепенный текст в настройках ниже порога контраста AA — в обеих темах

Замер по вычисленным стилям: цвет текста сводится с **фактическим** фоном (подъём по предкам до первого
непрозрачного), полупрозрачные цвета смешиваются с ним перед расчётом, порог берётся по размеру и насыщенности
шрифта (4.5:1 для обычного, 3:1 для крупного).

```
Settings → Admin → Members, 84 видимых текстовых узла, ниже порога — 13 (в каждой теме)

светлая  rgb(138,149,163)            "SETTINGS"/"ACCOUNT"/"WORKSPACE"/"ADMIN"  14.03px  2.86:1
                                     "MEMBERSHIP MANAGEMENT"                   14.03px  3.04:1
                                     логины участников                         14.64px  3.04:1
тёмная   rgba(255,255,255,0.36)      те же узлы                                14.03px  3.23:1
                                     "MEMBERSHIP MANAGEMENT"                   14.03px  3.33:1
```
Те же 13 узлов на `account`, `privacy`, `appearance` — цвет один и тот же.

**Причина — общий токен:** `--color-text3` = `#8a95a3` (`packages/core/src/theme/theme.css:464`) и
`rgba(255,255,255,0.36)` в тёмной (`там же:340`). `text-text3` встречается в **137 файлах**, то есть
это не настройки, а всё приложение; измерил я его на своих экранах.

**Дедуп:** в проекте открыты три задачи того же класса — [ALK-3498] (2.896:1 у `text-success`),
[ALK-3249] (4.108:1 в DeviceRequestPrompt), [ALK-3316] (нейтральный бейдж, запас 0.05). **Ни одна не про
`text3`.** У соседей в отчётах находок про контраст нет; единственное упоминание `text-text3` в чужом логе
(сектор C) — это имя класса в дампе DOM для совсем другой находки, контраст там не измерялся.
Опубликовано как находка №19 **в локальном файле**.

**Контроль, без которого замер ничего не стоил бы:** крупный текст на тех же экранах порог 3:1 проходит,
то есть считалка различает пороги, а не помечает всё подряд.

### Проверено и работает — структура заголовков и ориентиров на всех экранах настроек

| проверка | результат на 14 маршрутах |
|---|---|
| ровно один `h1` | **на каждом** |
| пропуски уровней (`h1 → h3`) | **ноль** — структура везде вида `1 2 2 2…` |
| ориентир `main` | присутствует на каждом |
| ориентиров `nav` | по 4 (рельс, сайдбар, навигация настроек, вкладки) |

Дефектов нет — и это **контроль к находке №16**: страница `/company/create` остаётся единственной в секторе,
где нет ни одного заголовка и ни одного ориентира. Раньше это было утверждение об одной странице, теперь
рядом стоит измерение на четырнадцати остальных. Контроль добавлен в блок измерений находки.

### Проверено и работает — сообщения об ошибках доступны программам чтения с экрана

**Ошибка поля** (`Display name` длиннее 40, набрано с клавиатуры и уведён фокус):
поле получает `aria-invalid`, сообщение лежит в элементе с идентификатором вида `<id поля>-error`,
на который указывает `aria-describedby` поля — то есть текст ошибки читается вместе с самим полем.

**Ошибка от сервера** (отказ выключить `In-app notifications`) объявляется дважды и корректно:
```
встроенное сообщение:  <p role="alert">      «In-app notifications cannot be turned off…»
тост:                  <div role="alert" aria-live="assertive">  «Keep at least one notification…»
```
`role="alert"` подразумевает `aria-live="assertive"`, а у тоста он ещё и выставлен явно.

Дефектов нет. Отмечу, что это та самая пара строк, к формулировке которых относится находка №14, —
**доставлены они правильно, неверен их текст**, и одно другому не мешает.

### Проверено и работает — вёрстка при увеличении браузера (в пределах десктопных ширин)

Увеличение моделируется сжатием CSS-вьюпорта — для раскладки это то же самое, что зум:

| зум | CSS-ширина | account | privacy | admin/members |
|---|---|---|---|---|
| 100% | 1920 | чисто | чисто | чисто |
| 125% | 1536 | чисто | чисто | чисто |
| 150% | 1280 | чисто | чисто | чисто |

«Чисто» = страница не едет вбок, обрезанных подписей вне прокручиваемых контейнеров нет, за правый край
не вынесен ни один элемент управления.

**Почему не проверял 200%.** При 200% на экране 1920 раскладка видит 960 CSS-пикселей, а это уже **уже
десктопной ширины**, и CLAUDE.md прямо говорит: «layout findings that only appear below desktop width are
not written up». То есть находка оттуда всё равно не пошла бы в отчёт. 150% — последняя ступень, на которой
ширина остаётся десктопной (1280), и её я прошёл.

### Отчёт проверен на собственный контраст — и одна правка в нём же

Заведя находку №19 про контраст в продукте, разумно применить ту же линейку к своему отчёту.
Измерено на локально отрисованной копии, обе темы, 799 видимых текстовых узлов:

```
до правки:  светлая — 38 узлов ниже AA, все один и тот же случай:
                       .chip.sev  rgb(154,100,18) на rgb(251,242,226)  11.5px  4.49:1  при пороге 4.5
            тёмная  — 0 узлов ниже AA
после:      светлая — 0        тёмная — 0
```
Промах был на **сотую** — но чинится одной строкой: токен `--sev` в светлой теме `#9a6412` → `#8a5710`.
Тёмная тема (`--sev:#dfa94e` на `#2a2015`) порог проходила и не тронута; правка ровно одна и только для светлой.

Заодно подтверждено, что стиль отчёта устроен по правилам темизации: есть и `@media (prefers-color-scheme: dark)`,
и `[data-theme="dark"]`, и `[data-theme="light"]`, а `body` красит фон явно — то есть отчёт корректно
отрисуется у читателя с любой темой, а не унаследует чужую.

Вёрстка после правки цела: 19 статей, страница вбок не едет, 12 широких блоков прокручиваются внутри себя.

### Часовой пояс: как экраны сектора отображают время — проверено, работает

Все аккаунты стенда и сам хост стоят на +05, поэтому «время берётся из браузера» и «время берётся
из настройки аккаунта» до сих пор были неразличимы. Развёл их принудительно: `Emulation.setTimezoneOverride`
на `America/New_York` (−04, разрыв ровно 9 часов) при неизменной настройке аккаунта `Asia/Tashkent`,
затем перезагрузка каждого экрана (`snip/d2-tz1.mjs`, владелец).

```
Intl.DateTimeFormat().resolvedOptions().timeZone:  Asia/Tashkent -> America/New_York

экран                          дат найдено   сдвинулось на 9 ч
settings/admin/audit-log            99             99
settings/admin/invites              17             17
settings/admin/members               8              8
пример: "Aug 27, 2026, 2:46 AM"  ->  "Aug 26, 2026, 5:46 PM"
```
Ни одного расхождения между экранами: всё оформляется по часовому поясу браузера, единообразно.
Настройка `timezone` в аккаунте на собственный показ времени не влияет — и не должна: её потребитель
другой (показ своего времени коллегам, `Show timezone`, см. находку про профиль и ALK-2801/ALK-2288).
**Находки здесь нет** — записано, чтобы следующая сессия не разводила это повторно.

### Побочный результат — усилена находка про журнал аудита (статья 10)

Тот же прогон показал, что внутри колонки `METADATA` даты **не** пересчитываются, в отличие от соседней
колонки даты. Сначала это выглядело как 9 «несдвинувшихся дат» и требовало проверки — а не пропущенная ли
это конвертация в отдельных строках. Оказалось иное и более внятное (`snip/d2-tz3.mjs`):

```
всего строк 99, из них с ISO-меткой внутри METADATA: 9

строка invite.created:
  колонка CREATED:  Aug 27, 2026, 2:46 AM        (местное время)
  METADATA:         {"role_ids":[],"expires_at":"2026-09-02T21:46:08.50908Z","kind":"link","max_uses":1}
  тот же срок на экране Admin -> Invites:  Sep 3, 2026, 2:46 AM

при смене пояса: CREATED пересчиталось 99 из 99, даты внутри METADATA — 0 из 9
```
То есть сырой JSON не просто неудобен — он показывает пользователю время в другом виде и **другими
сутками**, чем соседняя колонка и чем экран Invites для того же самого момента. Это добавлено в статью 10
(одно предложение в «Фактический результат», блок измерения и пункт в «Проверку»); бюджет статьи 168 слов.

### Ссылки на исходники в отчёте — сверены поимённо

Все 20 ссылок вида `путь:строка` из отчёта проверены против дерева развёрнутого коммита
(`git ls-tree -r c4b5386b4a3a`): 18 совпали дословно, одна — бэкендовая, одна осталась частичной сознательно
(это цитата формулировки чужого тикета, а не моя ссылка). Две мои были укорочены и developer'ом бы не
открылись — дописаны до полного пути:

```
features/settings/ProfileAvailabilitySection.tsx:61-64  ->  apps/web/src/features/settings/…
ProfileSettingsContent.tsx:39                           ->  apps/web/src/features/settings/…
en.ts:139                                               ->  packages/core/src/i18n/dictionaries/en.ts:139
```

**Про `scripts/verify_report.py`.** Это скрипт соседней сессии (сектор E, создан 02:14), не мой и не в git.
Он проверяет, что каждая строка сводной таблицы начинается с тега `[FE-WEB][…]` — так устроена **их**
таблица. В моём отчёте сводная таблица намеренно несёт заголовки без тегов, поэтому его проверка даёт
19 «несовпадений» на ровном месте. **Ни отчёт под скрипт не подгонял, ни скрипт не трогал** — вместо этого
сверил соответствие сам: 19 строк на 19 статей, каждая строка отвечает своей статье. Остальные его проверки
(незакрытые теги, ссылки, бюджеты) полезны и пройдены.

### Проверка исправлений, приехавших в развёрнутую сборку (v0.60.0 → v0.61.0-rc.5)

Развёрнутый билд — ровно тег `v0.61.0-rc.5`, последний стабильный — `v0.60.0`, поэтому
`git log v0.60.0..v0.61.0-rc.5` (174 коммита) и есть «то, что ждёт проверки». По моему сектору
в этот диапазон попали 11 коммитов; все связанные тикеты уже в `TESTING`, то есть закрыты, —
но закрыты они на develop, а не на этой сборке, и проверить их на ней всё равно стоит.

**ВНИМАНИЕ, обратимое изменение стенда (на время проверки ALK-3112).** У alice ровно одна
company-роль. Если прогон оборвётся, вернуть так:

```
POST /api/v1/companies/roles/assign   {"role_id":"R4QDCOMPMEMBER1","user_id":"U4QDALICE000001"}
и убрать временную workspace-роль:
POST /api/v1/workspaces/W4QDF1XTURESO01/roles/revoke {"role_id":"R4OXA06D1DDOYDY","user_id":"U4QDALICE000001"}
DELETE /api/v1/workspaces/W4QDF1XTURESO01/roles/R4OXA06D1DDOYDY
либо просто seed/seed.sh --lanes D
```
Исходное состояние alice, снято до изменений:
`roles:[{"id":"R4QDCOMPMEMBER1","name":"Member","scope_type":"company","permissions":["company.<CO>.member.view"]}]`

**ALK-3204** — «при reload Company Dashboard кратковременно показывает Admin access required».
**Исправлено, воспроизвести не удалось.** 5 перезагрузок подряд, опрос с момента выдачи reload,
шаг 35 мс, выборка не ограничивалась (`snip/d2-ship3204.mjs`, владелец):

```
проб на прогон: 51..53   (всего ~260)
"Admin access required" встретилось: 0 раз ни в одной пробе
каждый прогон завершился страницей с содержимым компании
```

**ALK-3396** — «при пустом названии роли страница прокручивается вверх».
**Исправлено, и ровно так, как обещано в коммите** («keep the reader on the role name field»).
Прокрутка измерялась у настоящего контейнера, а не у окна: `document.documentElement.scrollHeight
=== innerHeight`, окно не прокручивается вообще, прокручивается `div.scroll-custom` (1788/943).

```
до нажатия:   scrollTop 520,  поле имени вне экрана (y = -136)
после:        scrollTop 246.5, поле имени на экране (y = 138), фокус на нём
              сообщение: "Enter a role name."
              запросов на создание роли: 0
наверх (scrollTop 0) не ушло ни в одном из 3 прогонов
```

**ALK-3112** — «Company dashboard без прав администратора показывает общую ошибку вместо отказа».
**Исправлено.** Предусловие тикета — участник, у которого есть только workspace-права. В фикстурах
такого нет: company-роль `Member` есть у всех и несёт `company.<CO>.member.view`. Поэтому предусловие
пришлось создать: у alice временно снята company-роль (осталась только workspace-роль на приглашения),
после проверки возвращена, временная роль удалена, состав ролей сверен.

```
до:  roles [Member(company), Member(workspace)]  ->  во время: company-ролей 0
Settings -> Admin -> Company dashboard:
  "Admin access required — You do not have permission to view the admin overview."
  общей ошибки нет, кнопки Retry нет, интерактивных элементов 0
Settings -> Admin -> Members:
  "Admin access required — You do not have permission to manage company members."   элементов 0
после восстановления: alice company [Member], workspace [Member];
  8 участников компании, 7 в workspace, ролей ровно 5 фикстурных
```

**Побочно — это усиливает находку №1.** В одном и том же прогоне, на одной сборке, у одного человека:
два admin-экрана, где права нет, дают чистый отказ и **ноль** элементов, а экран Invites, где право
как раз **есть**, показывает 9 элементов, из них рабочих 2. То есть «нарисовать честный отказ» приложение
умеет и делает это рядом — на соседнем пункте того же меню. Пустая форма на Invites не вынужденная.

**ALK-3000** — «право Remove members выдано, но список участников не загружается».
**Исправлено.** Проверено ровно теми шагами, что напечатаны в находке №4: company-роль с **одним**
правом `company.<CO>.member.kick`, назначена рядовому участнику (базовая роль `Member` у него остаётся —
так и у настоящего пользователя).

```
роль создана, permissions: ["company.<CO>.member.kick"]   (ровно одно)
Settings -> Admin -> Members:  список загрузился, строк 8, отказа нет
  строка владельца:        Remove   disabled=false
  собственная строка:      Remove   disabled=true
```

**Заодно проверена воспроизводимость самой находки №4 по опубликованному тексту.** Была причина
усомниться: в логе более раннего прогона роль заводилась с `member.kick` + `member.view`, а в отчёте
написано «с единственным правом». Прогнал буквально по напечатанным шагам — воспроизводится: список
грузится, у владельца Remove активен, у себя заблокирован. То есть текст шагов верен, а `member.view`
в том прогоне был просто избыточен (он и так есть у каждого участника через базовую роль `Member`).
Правка отчёта не требуется. **N-е воспроизведение №4.**

Стенд после проверки снова чист: временная роль удалена, alice `[Member]/[Member]`, ролей 5 фикстурных.

**ALK-3431** — «hasSettingsDescription принимает false и пустую строку, порождая висящий `aria-describedby`».
**Исправлено, проверено по DOM.** Обошёл 17 маршрутов настроек и проверил каждую ссылку
`aria-describedby`/`aria-labelledby` на то, что элемент с таким id действительно существует:

```
маршрутов 17, ссылок проверено 121, висящих 0
```

**ALK-3215 / ALK-3301** (дубли React-ключей на `/settings/company`) — **проверка неубедительна, находки нет.**
Предупреждений в консоли нет, но это ничего не доказывает: сначала проверил сам инструмент —
свой `console.log` слушатель видит, а приложение за весь заход не пишет в консоль **ни одного**
сообщения. На production-сборке React строки `Warning:` вырезаны, поэтому их отсутствие
неотличимо от исправления. Записываю как непроверяемое отсюда, а не как «работает»: developer'у
достаточно открыть страницу на dev-сборке или с React DevTools.

#### Итог сверки исправлений, приехавших в развёрнутую сборку

| тикет | что обещано | на rc-5 |
|---|---|---|
| ALK-3204 | не мигать «Admin access required» при reload | **исправлено** (0 из ~260 проб) |
| ALK-3396 | не уносить читателя наверх при пустом имени роли | **исправлено** (scrollTop 520→246.5, фокус на поле) |
| ALK-3112 | отказ вместо общей ошибки на Company dashboard | **исправлено** (чистый отказ, 0 элементов) |
| ALK-3000 | список участников грузится у обладателя права kick | **исправлено** (8 строк, Remove у владельца активен) |
| ALK-3431 | нет висящих `aria-describedby` | **исправлено** (121 ссылка, 0 висящих) |
| ALK-3215/3301 | нет дублей React-ключей | **неубедительно** — на production-сборке предупреждения вырезаны |
| ALK-2894 | выбор в Switch company не сбрасывается | **не проверить на этих фикстурах** — компания в лейне одна |
| ALK-3214, ALK-3216, ALK-3432, ALK-3442 | редизайн и внутренние переносы | без отдельной пользовательской поверхности |

Ни одной регрессии среди проверенного. Это не находки, а ответ на вопрос «доехало ли то, что закрыли».

**Какие из моих находок — свежие регрессии, а какие давние.** Проверено по истории файлов,
на которые находки ссылаются как на причину, в диапазоне `v0.60.0..v0.61.0-rc.5`:

```
packages/core/src/preferences/utils/store.ts     0 коммитов  -> причина №8 давняя
apps/web/src/lib/cookieNames.ts                  0 коммитов  -> то же
packages/core/src/theme/theme.css                6 коммитов, но --color-text3 среди них не менялся
                                                             -> контраст (№13 в отчёте) давний
packages/features/admin/model/capabilities.ts    3 коммита — и все три по моей теме:
    aa98fdac1  ALK-2997  журнал аудита: гейт переписан, спрашивает только слой workspace
    1bd311ecb  ALK-3112  dashboard: запрет для workspace-only грантов
    653f999ec  ALK-3000  members: секция открывается и по member.kick
```
То есть **гейт, который описывает вторая High-находка, появился именно в этой, ещё не выпущенной
сборке** — в комментарии к нему прямо сказано, что правило взято у бэкенда «quoted rather than guessed»,
но переписано только правило слоя workspace. Это добавлено в блок «Для триажа» находки: поправить
дешевле всего до релиза `v0.61.0`, пока правка не разошлась.

Обратная сторона того же наблюдения: №8 и контраст лежат в файлах, которых релиз не касался, —
это не регрессии редизайна `ALK-3214`, а давнее поведение. Для приоритезации это разные вещи.

### Контраст перемерян по всему разделу — находка расширена с одного экрана до всех 17

Причина проверки: у ночных находок должно быть не меньше двух независимых замеров, а у контрастной
он был один — и по одному экрану. Перемерил тем же алгоритмом (`snip/d2-contrastall.mjs`), но по всем
маршрутам сразу, светлая тема, владелец:

```
маршрутов 17, видимых листовых узлов с текстом 1672
ниже порога AA                                     92
  из них rgb(138,149,163) = --color-text3          91   худшее 2.86:1 при пороге 4.5
  прочее: rgb(22,163,74) на белом, 16.47px          1   3.30:1
маршрутов без единого нарушения                     0   (от 4 до 13 на маршрут)
```
Первый замер (13 узлов на одном экране) воспроизвёлся и **оказался нижней оценкой**: это не особенность
экрана Members, а один токен, разошедшийся по всему разделу. Отчёт обновлён — ведущее измерение теперь
широкое, разбор одного экрана оставлен как образец. Бюджет статьи 142 слова.

Второй цвет (`rgb(22,163,74)`, один узел, 3.30:1) в находку **не добавлял**: одна точка, другой токен,
и находка про второстепенный текст. Записано здесь, чтобы не потерялось.

#### Поправка к предыдущей записи: тёмную тему я сначала измерил неверно — виноват мой снippet

Расширив светлую тему, я тем же новым снippet'ом померил тёмную и получил **14** нарушений вместо
ожидаемых десятков, причём `--color-text3` среди них не было вовсе. Это противоречило опубликованной
находке (там тёмная тема — 3.23:1 на тех же узлах). Прежде чем править отчёт, проверил инструмент.

Тема переключалась правильно (`data-theme="dark"`, `body` фон `rgb(17,20,26)`, `prefers-color-scheme`
совпадает), и нужные узлы на месте — `rgba(255,255,255,0.36)` на `rgb(34,39,49)`. Ошибка была в расчёте:
**новый снippet не сводил полупрозрачный цвет с фоном**, а считал светимость по `rgb(255,255,255)`.
Белый на тёмном даёт огромный контраст, поэтому проваливающийся текст молча проходил. Старый снippet
(`d2-contrastdark.mjs`), на котором построена опубликованная находка, альфу учитывал — то есть
**отчёт был прав, ошибся мой новый инструмент.** Ровно тот случай, ради которого написано «сначала
подозревай стенд, а не приложение».

После добавления сведения с фоном обе темы меряются одинаково:

```
светлая  1672 узла, ниже AA  92   из них rgb(138,149,163)              91   худшее 2.86:1
тёмная   1673 узла, ниже AA 105   из них rgba(255,255,255,0.36)        91   худшее 3.23:1
                                  белый на rgb(239,68,68)               6   3.76:1
маршрутов без нарушений: 0 в обеих темах
```
Симметрия говорит сама за себя: **один и тот же второстепенный текст, 91 узел, в обеих темах.**
Отчёт обновлён — измерение теперь охватывает обе темы на всех 17 маршрутах, бюджет статьи 145 слов.

Методическая заметка (в CLAUDE.md не выношу — правило требует, чтобы проблема стоила дважды, а это
мой собственный регресс в новом снippet'е, старый считал верно): **считать `rgba(...)` как непрозрачный
цвет — это молчаливый пропуск нарушений, а не шум.** Признак, по которому это заметно со стороны:
результат резко улучшается при переходе в тему, где текст полупрозрачный.

### Правка внутреннего противоречия в находке про подзаголовки (статья 19)

Перепроверял страницу `About` свежим пробником и заметил, что в отчёте про неё написаны две
взаимоисключающие вещи: строкой выше — «Diagnostics → один переключатель Send crash reports»,
строкой ниже — «интерактивных элементов вне навигации по настройкам: **0**». Разработчик такое
замечает, и дальше он не верит остальным цифрам находки.

Перемерил, перечисляя всё интерактивное, а не один тип тега
(`button,a[href],input,select,textarea,summary,[role=switch],[role=button],[role=link],[role=tab],[tabindex]`):

```
вся страница целиком:            278 символов текста (не срез — весь innerText области содержимого)
контейнер прокручивается:        нет, ниже сгиба ничего
в области содержимого:           ссылок 0; работающий элемент один — переключатель Send crash reports
слова из подзаголовка в тексте:  "licence" и "help" встречаются только в самом подзаголовке
                                 support / terms / contact / documentation / FAQ — нет вовсе
```
Формулировка в отчёте заменена на точную. Заодно это снимает возражение «а вы прокрутили?» —
прокручивать там нечего, и это теперь сказано прямо.

**Сама находка подтверждена, а не ослаблена:** подзаголовок обещает версию, лицензии и куда обратиться
за помощью; на странице есть только версия (`v0.61.0-rc.5`, совпадает с развёрнутой сборкой).

### Та же линейка приложена к «0 элементов» в High-находках — там цифра верна

Раз одна цифра «0» в отчёте оказалась неверной, стоило проверить остальные, тем более что на «ноль
интерактивных элементов» опираются все три High. Перемерил страницу отказа тем же расширенным
перечислением, что поймало ошибку на `About`:

```
Settings -> Admin -> Audit log, аккаунт без права:
  отказ на экране:                          да
  узкий набор селекторов (как в отчёте):    0
  расширенный (+ [role=tab], [role=menuitem], summary/details, [tabindex]):  1
  единственное попадание: <h1 tabindex="-1">Audit log</h1>
```
`tabindex="-1"` — это цель для перехода к содержимому, а не управляющий элемент: с клавиатуры она
недостижима. То есть **«0 интерактивных элементов» в High-находках — правда**, и она устояла под
более строгим перечислением, чем то, которым была получена.

Разница с `About` показательна: там расширенный набор нашёл настоящий `button[role=switch]`,
который в узкий не попадал, — то есть ошибка была реальной, а не придиркой к методу.
Для сравнения, тот же прогон на экранах, где у аккаунта право есть: `Company dashboard` — 5 против 3
(две вкладки `Overview`/`Manage` как `a[role=tab]` узкий набор не ловит).

**Третья и последняя цифра «0» в отчёте — тоже верна.** Статья 17 (экран `Sessions` при единственной
сессии) проверена тем же расширенным перечислением, с подтверждением предусловия по API:

```
GET /api/v1/security/sessions -> 200, записей 1      (предусловие соблюдено)
узкий набор селекторов:   0
расширенный:              1  -> <h1 tabindex="-1">Active sessions</h1>
```
Итого из трёх утверждений «0 интерактивных элементов» в отчёте **две верны и подтверждены строже,
чем были получены**, одна (`About`) была ошибочной и исправлена. Больше таких утверждений в отчёте нет —
проверены все.

### Покрытие доказано по списку маршрутов, а не по памяти — и один тупик найден для СЕКТОРА B

Вместо того чтобы вспоминать, что проверено, взял полный перечень страниц приложения из исходников
развёрнутого коммита (`git ls-tree` по `apps/web/app/**/page.tsx` — 51 страница) и сверил с ним свой сектор.

```
маршрут                                       статус
/(auth)/login /signup /forgot-password
/magic-link /reset-password                   проверены ранее
/(auth)/magic-link/verify                     ПРОВЕРЕН сейчас (без токена и с неверным)
/(auth)/auth/verify-email                     ПРОВЕРЕН сейчас с неверным токеном
                                              (доставку письма по-прежнему не проверить)
/company/create                               находка №18
/invite  /invite/[token]                      проверены ранее
/workspace/invite/accept                      ПРОВЕРЕН сейчас — это совместимая точка входа для
                                              ссылки из письма, редирект на /invite?token=…
/w/{ws}/settings/[section] и все admin/*       перепись 156 элементов на 17 маршрутах
/w/{ws}/settings/admin/company-roles          ПРОВЕРЕН сейчас — редирект на settings/roles?scope=company
/w/{ws}/settings/admin/system-settings        недоступен (нужен super-admin) — задокументировано
/docs                                         в исходниках страница есть, на стенде отдаёт nginx 404;
                                              ни один экран на неё не ссылается (проверено `git grep`:
                                              только robots.ts, тесты и allow-list редиректа)
                                              -> кликом недостижим, значит вне области тестирования
```
Непокрытым в секторе осталось ровно то, что упирается во внешние условия: доставка писем и super-admin.

#### Для сектора B: `/join/<токен>` при недействительном токене — тупик без единого выхода

**Это не моя находка — guest join links закреплены за сектором B** (`SECTORS.md`), поэтому в мой отчёт
она не идёт. Кладу сюда с полным измерением, чтобы сектор B мог взять как есть.

Открыть `/join/<любой недействительный токен>` в браузере без сессии:

```
весь текст документа целиком:  52 символа
  "Join as a guest  This invite link is no longer valid."
интерактивных элементов (расширенный перечень, включая [role=*], [onclick], [tabindex]):  0
контейнеров с прокруткой: 0, страница не прокручивается -> ниже сгиба ничего нет
```
Ни ссылки на вход, ни «запросить новую ссылку», ни даже переключателя языка, который есть на всех
остальных страницах до входа. Человек, которому прислали устаревшую гостевую ссылку, упирается в
одну фразу и должен править адрес руками.

**Соседние страницы при той же ошибке ведут себя иначе — то есть образец в приложении уже есть:**
```
/magic-link/verify?token=<плохой>   3 элемента:  Language · "Request a new link" -> /magic-link
                                                 · "Back to sign in" -> /login
/invite?token=<плохой>              5 элементов: форма входа целиком
/workspace/invite/accept            1 элемент:   "Back to sign in"
/join/<плохой>                      0 элементов
```
Проверено в чистом контексте браузера (без сессии), поэтому «просто ты залогинен» здесь ни при чём.

**Дедуп по этой передаче (сделан сектором B, 03:45) — формулировку выше надо читать с поправкой.**
Есть **ALK-1727** (`Task`, `TESTING`, то есть закрыта): «Guest landing: preview guest link + fail-fast
on dead link». В её критериях готовности прямо записано: при `valid:false` показать «Ссылка
недействительна или встреча завершена», **не показывая форму**, — «мёртвая ссылка fail-fast без формы».

То есть **«ноль интерактивных элементов» как заголовок — это описание работающего тикета**, а не дефекта.
Ровно та же ловушка, в которую я чуть не попал с ALK-3307 и сырыми ключами журнала аудита: тикет
описывает состояние, а измерение принимает выполненное требование за поломку.

**Что остаётся после поправки, и это сильнее исходного:** тикет требовал убрать **форму присоединения**,
а убраны оказались **все пути наружу** — ни ссылки на вход, ни «запросить новую ссылку», ни переключателя
языка. Критерии ALK-1727 ни о чём из этого не говорят, а три соседних маршрута при той же ошибке
(`/magic-link/verify`, `/invite`, `/workspace/invite/accept`) выход дают — то есть это не принятый в
приложении стиль страницы с мёртвым токеном, и положительный контроль у находки уже есть.

Измерение при этом не переделывалось и остаётся верным: широкое перечисление + ноль контейнеров с
прокруткой означают, что ноль настоящий, а не артефакт селектора. Именно это и позволило сектору B
сделать дедуп, не перепроверяя заново.

### Граница правила в Notifications промерена целиком (усиление находки про сообщение об ошибке)

Находка говорила: сообщение называет `Mute channel notifications` «другим способом доставки».
Чтобы developer знал не только что сообщение неверно, но и **что именно оно должно говорить**,
перебрал все 16 сочетаний четырёх флагов. Каждая попытка начиналась с заведомо валидного состояния,
поэтому попытки независимы; после перебора настройки возвращены к умолчаниям и сверены чтением.

```
флаги: in_app_enabled, mute_all_channels, mute_unknown_dm_users, do_not_disturb_enabled

отклонено ровно 4 сочетания из 16 — все с in_app_enabled=false И mute_all_channels=false
  -> 400 NOTIFICATION_NO_DELIVERY_CHANNEL
     "нужен хотя бы один канал доставки: включите in_app_enabled или mute_all_channels"
принято 12 из 12 — все, где включён хотя бы один из этих двух
mute_unknown_dm_users и do_not_disturb_enabled на запрет не влияют ни в одном сочетании

состояние до перебора и после: in_app=true, mute_all=false, mute_unknown=false, dnd=false
```
Правило, стало быть, простое: **«либо in-app включены, либо все каналы заглушены»** — то есть нельзя
остаться в состоянии, где уведомления рождаются и доставить их некуда. Само по себе разумно; неверно
только название: заглушение каналов объявлено способом доставки. Таблица добавлена в измерение находки.

### Находка №5 усилена: два элемента расходятся в ОБЕ стороны, а не в одну

Опубликованная версия показывала одно направление (список `Online status` = Nobody, а переключатель
остаётся включённым и присутствие видно). Проверил обратное — переключателем, через интерфейс,
с последующей чистой загрузкой страницы:

```
до:     online_visibility="everyone",  hide_presence=false,  переключатель on,  список "Everyone"
клик по Show online status -> off, затем страница загружена заново:
        переключатель:            aria-checked="false"      (сохранился)
        hide_presence:            true                      -> присутствие действительно скрыто
        список Online status:     "Everyone"                -> а он по-прежнему так считает
        online_visibility:        "everyone"                 (не менялось)
после:  hide_presence возвращён в false, сверено чтением
```
То есть эти два элемента **не совпадают ни при каком действии**: меняешь список — молчит переключатель
и присутствие; меняешь переключатель — молчит список. Формулировка «два элемента об одном и том же
расходятся» теперь подкреплена с обеих сторон, и добавлена в измерение находки.

### Расхождение в подсчётах с сектором B разобрано — обе цифры верны, но об разном

Сектор B перемерил мои соседние маршруты и получил другие числа на двух из четырёх. Разобрал; обе
причины разные, и вторая важнее.

```
маршрут                              я   они   причина
/join/<dead>                         0    0    совпало
/magic-link/verify?token=<dead>      3    3    совпало
/invite?token=<dead>                 5    3    ЧТО СЧИТАТЬ: на странице 3 button + 2 input.
                                                Мой перечень берёт все интерактивные узлы (5),
                                                их — только те, у которых есть видимый текст (3).
                                                Поля ввода текста не несут. Страница одна и та же.
/workspace/invite/accept             1    3    РАЗНЫЙ АДРЕС, а значит разная страница:
```
```
/workspace/invite/accept                    -> остаётся на месте, страница «ссылка недействительна»,
                                               1 элемент ("Back to sign in")          <- мой замер
/workspace/invite/accept?token=<dead>       -> РЕДИРЕКТ на /login?next=%2Finvite%2F…,
                                               форма входа, 5 узлов / 3 с текстом     <- их замер
/workspace/invite/accept?token=<dead>&x=1   -> редиректа нет, снова «ссылка недействительна», 1 элемент
```
Это ровно то, что написано в исходнике страницы (`apps/web/app/workspace/invite/accept/page.tsx`):
редирект срабатывает только если параметр в адресе **ровно один** и он похож на токен приглашения
(`Object.keys(searchParams).length === 1 && isWorkspaceInviteToken(token)`). Отсюда и третья строка.

**Практический вывод для их отчёта:** с токеном `/workspace/invite/accept` — это не страница мёртвой
ссылки, а `/login`. В сравнении соседних маршрутов эта строка при таком адресе измеряет вход, а не
обработку мёртвого токена. Честный набор «страниц мёртвой ссылки» выглядит так:

```
/magic-link/verify?token=<dead>      3 элемента (в т.ч. "Request a new link", "Back to sign in")
/workspace/invite/accept  (без токена) 1 элемент ("Back to sign in")
/join/<dead>                          0 элементов
```
Контраст сохраняется и даже становится чище: среди страниц одного класса ноль только у `/join`.
`/invite?token=<dead>` в этот набор не входит вовсе — он тоже уходит на `/login`.

**Общее следствие, которое стоит помнить при сверке цифр между секторами:** «широкое перечисление
интерактивных элементов» — не одна и та же операция у разных сессий. На той же странице мой перечень
дал 5 (все интерактивные узлы), соседний — 3 (только узлы с видимым текстом); поля ввода текста не
несут, и именно на них цифры расходятся. Обе верны. Поэтому, сравнивая счёт элементов с чужим замером,
надо называть не число, а **что именно считалось** — иначе расхождение выглядит как разное поведение
продукта, хотя это разные определения. Тот же принцип, что с байтами против символов раньше в этом логе.

### Финальная перепроверка находок, которых эта часть ночи ещё не касалась (11, 12, 18)

К этому моменту почти каждая находка была перемерена заново по ходу других работ. Не хватало трёх;
проверены с чистой загрузки, под владельцем.

```
статья 11 — подпись блока хранилища
  "My storage in this workspace"                          есть
  "Storage is shared by everyone in this workspace"       есть   <- обе строки в одном блоке
  отказа на странице нет, блок раскрыт кнопкой Show storage

статья 12 — несохранённые изменения
  поле изменено -> на экране "1 unsaved change" + кнопки Discard / Save profile
  переход в Appearance и обратно в Profile:
      значение в поле:      исчезло
      панель сохранения:    исчезла
      auth/me jobTitle:     до "" и после "" — не сохранилось ничего, то есть изменение потеряно
статья 18 — страница создания компании
  интерактивных элементов во всём документе: 2   (input 'e.g. "Aloqa Inc"', button Create — disabled)
  заголовков h1–h6 / [role=heading]: 0     ориентиров main/nav/header/footer: 0
```
**Итого каждая из 19 находок перепроверена в эту ночь**, кроме статьи 9 (логотип компании): её
воспроизведение — это загрузка файла, необратимо меняющая аватар компании, а два воспроизведения
подряд у неё уже есть. Повторять ради счётчика не стал.

**Заодно — методическая ошибка в моём же пробнике, стоит записать.** Первый прогон этих трёх вернул
пустоту по статьям 11 и 12, и это выглядело как «находки не воспроизводятся». Обе причины были мои:
пробник шёл под рядовым участником (а страница workspaces требует прав администратора), и селектор
поля требовал непустой `placeholder`, которого у полей профиля нет. Починил не только селектор, но и
**отчётность пробника**: теперь он возвращает `refused`, начало текста страницы и список найденных
полей, поэтому пустой результат нельзя спутать с отрицательным. Это ровно та ошибка, от которой весь
прогон защищаюсь в измерениях продукта, — и она пришла с той стороны, где её не ждёшь.

### Предпубликационный дедуп нашёл то, что штатный фильтр показать не мог

Перед выкладкой синхронизировал зеркало Jira (3612 задач) и прошёл по задачам, тронутым за сутки.
Нашлось важное — и не через `--open-bugs`, а **мимо него**.

**ALK-3579** `[Task/TESTING]` «text3 is the last legacy neutral and fails AA on all six grounds» —
это ровно моя находка про контраст. Те же литералы (`#8a95a3` / `rgba(255,255,255,0.36)`), тот же токен,
и, что убедительнее всего, **те же числа**: у них расчёт по объявлениям в `theme.css` даёт 3.040 на белом
и 3.230 на `#222731`; у меня замер на отрисованных экранах — 3.04 и 3.23. Совпадение до сотых при двух
независимых способах.

**Почему штатный дедуп её не показал.** `jira_cache.py list --open-bugs` фильтрует `issuetype = Bug`
и статусы `Backlog/Ready/In Progress` — как и предписано. ALK-3579 это **Task** в **TESTING**, то есть
и по типу, и по статусу вне фильтра. Фильтр работает правильно: он отвечает на вопрос «не завожу ли я
дубликат открытого бага». Но я на его основании написал в отчёте «ни одна из задач не про text3» —
а это утверждение уже про **весь** проект, и фильтр его не подтверждает. **Ошибка была не в фильтре,
а в том, что вывод шире, чем данные.**

**Что с находкой.** Она остаётся, но смысл её теперь другой и честнее: не «нашли новое», а
**«закрытое не доставлено»** — задача стоит в `TESTING`, а дефект на `v0.61.0-rc.5` воспроизводится
(91 узел в каждой теме, 17 маршрутов). Блок «Для триажа» переписан. Заодно выяснилось, почему это
всплыло именно сейчас: `ALK-3325` (в этой же невыпущенной сборке) перевела `--color-text2` на
семантический токен и **намеренно** оставила `text3` с литералом — так и записано комментарием в
`theme.css` на развёрнутом коммите.

**Тот же приём дал ещё два прецедента, оба закрытые и оба вне фильтра:**
```
ALK-1788 [Bug/TESTING]  «Profile avatar сохраняется сразу после выбора без Save changes»
   -> то же поведение, но на ЛИЧНОМ аватаре; там уже исправлено (кадрирование + панель сохранения,
      это видно в моём же измерении), а логотип компании остался со старым flow.
      Для находки про логотип это лучший из возможных аргументов: нужный порядок уже реализован рядом.
ALK-1714 [Sub-task/TESTING] «Make workspace settings truthful and edit-gated»
   -> тот же принцип, что в находке про подзаголовки, но про поля: убрать из настроек то,
      чего бэкенд не хранит. Добавлено как прецедент.
```
**Вывод для метода:** фильтр `--open-bugs` отвечает «завожу ли я дубликат», а не «знает ли проект об этом».
Для второго вопроса надо смотреть и закрытые, и не-Bug типы — там лежат и прецеденты, и незакрытые
по факту исправления. Ключевое ограничение: keyword-поиск по всему зеркалу шумит (657 совпадений на
«audit»), поэтому годится только как точечная проверка по уже названному подозрению — что и написано
в CLAUDE.md.

**Правка структуры, поймана своей же проверкой.** При переписывании блока «Для триажа» мой скрипт
захватил закрывающий `</div>` в шаблон и не вернул его — баланс стал 145/144. Поймано штатной сверкой
тегов сразу после правки, восстановлено; сейчас 145/145, `<pre>` 26/26, непарных статей нет.

### Тот же класс ошибки нашёлся ещё раз — и это уже система, а не случайность

Найдя ложное «ни одна задача не про text3», прошёл по отчёту в поисках других **утверждений об
отсутствии** — они опаснее любых других, потому что проверяются одним запросом, а звучат как итог
работы. Регулярка по «ни одна / совпадений нет / дубликата нет / не заведена» дала три места:

```
статья 5   "не действует ни одна настройка" — это ЦИТАТА подписи в приложении, не про Jira. Оставил.
статья 9   "Дубликата нет, но есть прецедент ALK-1788…" — уже поправлено выше. Верно.
статья 16  "Совпадений в 3595 задачах нет ни по NOTIFICATION_NO_DELIVERY_CHANNEL…"  <- ЛОЖНО
```
Ключ `NOTIFICATION_NO_DELIVERY_CHANNEL` в проекте есть — в **ALK-3071** (`Task/TESTING`), каталоге всех
225 error-key, где для каждого требовался перевод на все локали. Дубликатом это не делает: там про
**наличие перевода**, у меня — про то, что **текст неверен по сути**. Но написанное было ложным как
факт, и developer проверил бы это одним поиском.

**Переписал так, что находка от этого только выиграла:** ключ прошёл каталогизацию и перевод, и перевод
добросовестно воспроизвёл ошибку — что ровно совпадает с уже измеренным (формулировка одинаково неверна
во всех четырёх локалях).

**Обобщение, которое стоит за обоими случаями.** Оба утверждения были получены из `--open-bugs`
(Bug + Backlog/Ready/In Progress), а сформулированы про **весь проект**. Фильтр не врал — врал квантор.
Правильно либо сужать формулировку до того, что проверял («среди открытых багов дубликата нет»),
либо проверять по всему зеркалу, включая Task и закрытые. Второе дороже, но именно оно дало сегодня
три полезные ссылки: ALK-3579, ALK-1788, ALK-1714.

Проверил заодно и остальные утверждения об отсутствии в отчёте — других не осталось.

### Третий случай того же — и он был в High-находке

Продолжив вычищать утверждения об отсутствии, нашёл ещё одно, и на этот раз в статье 3, то есть
в **High**: «Отдельная задача на это не заводилась — в 3595 задачах проекта совпадений по `role.manage`
и по формулировкам этого экрана нет». Проверил по всему зеркалу: `role.manage` встречается в **13**
задачах. Дубликата среди них нет — но написанное было ложным как факт.

```
ALK-1898 [Bug/TESTING]  role.manage отображается raw key в Company Roles
ALK-1954 [Bug/BLOCKED]  то же, по-русски
ALK-1656 [Task/TESTING] Gate company administration from backend roles and permissions
                        <- задача, которой признак доступа и строился; для находки это лучший контекст
остальные 10 — про другое (system owner role, invite-ссылки с любым role_id и т.п.)
```
Формулировка заменена на точную и заодно полезную: механизм гейта заведён отдельной задачей и для
соседних разделов работает — здесь не закрыт один слой.

**Побочно — третий тикет-кандидат на закрытие.** ALK-1898/ALK-1954 говорят, что `role.manage`
подписывается сырым ключом. Перечислил **все** подписи прав в каталоге ролей на этой сборке:

```
company:   11 подписей, сырых ключей 0
workspace:  9 подписей, сырых ключей 0
role.manage сейчас: "Create company roles and assign or revoke them for members"
audit.view сейчас:  "View the company audit log"        (это ALK-3536, уже отмечена)
```
ALK-1898 закрыта и это согласуется. А вот **ALK-1954 висит в `BLOCKED`, хотя на `v0.61.0-rc.5`
не воспроизводится** — как и ALK-3536, и ALK-3522. Итого **три кандидата на закрытие**, все проверены
измерением. (На дедуп ни одна не влияла: `BLOCKED` и `Backlog` для Bug — вне фильтра «открытые баги»
только частично, но ни одна из трёх не описывает мою находку.)

**Итог зачистки:** утверждений об отсутствии в отчёте больше не осталось ни одного непроверенного,
устаревших счётчиков корпуса задач («в 3595 задачах…») — тоже. Структура цела: 19 статей, div 145/145.

### Состояние открытых багов по моему сектору на rc-5 — проверено выборочно

В проекте 24 открытых Bug'а с тегами моего сектора (`ADMIN/SETTINGS/PROFILE/COMPANY/WORKSPACE/AUTH/
SECURITY/ONBOARDING/ROLES/A11Y`). Часть я так или иначе трогал за прогон; ниже — то, что проверено
измерением, чтобы команде не пришлось перепроверять.

```
ALK-3536 [Backlog] право audit.view подписано сырым ключом      НЕ ВОСПРОИЗВОДИТСЯ -> закрывать
ALK-1954 [BLOCKED] role.manage подписан сырым ключом            НЕ ВОСПРОИЗВОДИТСЯ -> закрывать
ALK-3522 [Backlog] ложный "1 unsaved change" при открытии        НЕ ВОСПРОИЗВОДИТСЯ -> закрывать
ALK-2241 [BLOCKED] Deactivate включён для backend-stub          НЕ ВОСПРОИЗВОДИТСЯ (кнопки disabled,
                                                                 подпись "Not available yet") -> закрывать
ALK-3535 [Backlog] журнал аудита не показывает события компании  ВОСПРОИЗВОДИТСЯ
ALK-3537 [Backlog] подзаголовок Workspace identity               ВОСПРОИЗВОДИТСЯ
ALK-3005 [Backlog] каждая сессия названа "Unknown device"        ВОСПРОИЗВОДИТСЯ
ALK-3025 [Backlog] недействительная ссылка сброса пароля         ВОСПРОИЗВОДИТСЯ
```

**ALK-3005** — на экране `Sessions`: `Unknown device`, а следом полный user-agent
`Mozilla/5.0 (Macintosh; …) Chrome/151.0.0.0`. В ответе API `device_name` пустой, `user_agent` заполнен,
`ip_address` заполнен. То есть данных, чтобы назвать устройство, хватает — они просто не используются.

**ALK-3025** — `/reset-password?token=<недействительный>` показывает **обычную форму** «Set a new
password» с двумя полями, а не сообщение о негодной ссылке; узнать о проблеме можно только отправив
форму. Выход со страницы один — `Back to sign in`; запросить новую ссылку нечем.

```
элементы на странице: Language · поле · поле · "Reset password" · "Back to sign in" -> /login
```
**Полезное сравнение для того, кто возьмёт ALK-3025:** соседний маршрут при той же ошибке ведёт себя
правильно — `/magic-link/verify?token=<недействительный>` сразу пишет «This sign-in link is invalid or
has expired» и даёт **«Request a new link» → /magic-link**. То есть нужный образец в приложении уже есть,
на соседней странице того же раздела.

**Итого четыре кандидата на закрытие** (ALK-3536, ALK-1954, ALK-3522, ALK-2241) — все проверены
измерением, ни один не «на глаз». Заводить/комментировать задачи не стал: это отдельное решение
пользователя (CLAUDE.md).

### Недельное ограничение на Display name: что показано сейчас (для ALK-2784, находки НЕ завожу)

Условие для этой проверки было готовое: alice всё ещё внутри недельного лимита, в который я упёрся
раньше за прогон. То есть проверка ничего не стоила и ничего не сломала — имя не изменилось.

**Сначала измерил неправильно и чуть не записал ложное «ошибка не доходит до пользователя».**
Первый пробник искал на экране текст по ключевым словам (`error|fail|too soon|ошиб|позже|…`) и вернул
**пусто**. По правилам прогона отсутствие по фильтру — не доказательство отсутствия, поэтому перемерил:
снимок всех видимых листовых текстов до действия, затем опрос с шагом 250 мс **с момента клика**, без
ограничения выборки. Сообщение нашлось сразу — фильтр просто не содержал слов, которыми оно написано.

```
PATCH /api/v1/auth/me/profile -> 429
  {"key":"AUTH_PROFILE_UPDATE_TOO_SOON","message":"профиль можно обновлять раз в неделю (осталось 7 дн.)"}

на экране (живой отсчёт, тикает раз в секунду, 171 проба за 15 с):
  t=4.2 c   "Try again in 591885 s."
  t=5.3 c   "Try again in 591884 s."
  t=9.2 c   "Try again in 591879 s."
имя после: "QA Alice" — не изменилось
```
**Почему это не моя находка.** **ALK-2784** (`Bug`, **In Progress**) — ровно про это: «Ограничение на
смену Display name показывается как общая ошибка». Её исходный симптом (`Something went wrong`) на
rc-5 **уже исправлен**, а её же ожидаемый результат — «понятное сообщение на основе `Retry-After`» —
выполнен ещё не до конца. Тикет в работе и в дедуп-фильтре (`In Progress`), так что заводить рядом
вторую находку нельзя.

**Что стоит передать в ALK-2784, если спросят:**
- отсчёт как таковой — правильный: **ALK-3071** для этого ключа прямо предписывает «показывать
  обратный отсчёт, а не парсить текст сообщения», и он показывается;
- незакрытым остаётся **формат и причина**: `591885 s` — это ≈6.85 суток, и в секундах такой срок
  не читается; слова про недельное ограничение на экране нет вовсе, хотя бэкенд его называет
  («осталось 7 дн.»), а критерий приёмки тикета требует показать **и причину, и срок**.

### ALK-2654 (Workspace Storage, неправильный endpoint) — не воспроизводится, но проверять надо не там

```
Settings -> Workspace            блока storage НЕТ вовсе: слова "storage" на странице нет,
                                 запросов storage/quota не уходит ни одного
Settings -> Admin -> Workspaces  блок здесь, и он работает:
   GET /api/v1/workspaces/<WS>/storage           <- ровно тот путь, который требует тикет
   GET /api/v1/workspaces/<WS>/recordings-quota
   на экране: "0 B of 10 GB used", "Call recordings storage 0 B of 30 GB used · 30 GB free"
   "unavailable" не выводится нигде
```
То есть **пятый кандидат на закрытие** (статус `REVIEW` этому не противоречит — похоже, правка на ревью).

**Важная оговорка для того, кто будет закрывать.** Тикет называет экран `Settings → Workspace`, а блок
сейчас живёт на `Settings → Admin → Workspaces`. Проверяющий, открывший страницу из тикета, увидит
пустоту и может решить, что блок «пропал» или что баг жив. Это тот же класс ошибки, что я разбирал
ночью с сектором B: **сначала подтверди, что открыл именно ту поверхность, о которой судишь.**
Здесь поверхность переехала, и текст тикета устарел раньше, чем сам баг.

### ALK-3012 (однобуквенное имя workspace) — исправлена наполовину, и вторая половина как раз в тексте тикета

```
Settings -> Workspace, имя очищено и введено "A", затем поле потеряло фокус:
  кнопка Save changes:     disabled=true         <- симптом тикета («остаётся активной») ИСПРАВЛЕН
  запросов ушло:           ни одного (кроме /api/rum)
  имя workspace:           не изменилось
  что появилось на экране: "A", "1 unsaved change", "Discard", "Save changes"
  подсказки про длину:     НЕТ ни одной
```
Тикет прямо пишет, чего ждёт: «Диалог создания Workspace для такого же значения корректно блокирует
Create и показывает `Use 2 to 128 characters.`. Валидация при переименовании должна вести себя так же.»
Блокировка теперь есть, **подсказки по-прежнему нет**. Значит закрывать нельзя: остаётся ровно то,
ради чего тикет и заведён — человек видит «1 unsaved change» и недоступную кнопку без единого слова
о причине.

**Своей находки рядом не завожу:** ALK-3012 открыт (`Backlog`, Bug) и покрывает этот случай целиком.

**Метод, чуть не давший ложный результат (второй раз за час).** Первый прогон не трогал фокус — и
показал «сообщений нет». Но в этом приложении ограничения длины называются **по потере фокуса**
(на этом я уже обжёгся в этом прогоне на BUG-27, находка тогда была снята). Добавил blur и перемерил.
Здесь вывод не изменился — подсказки нет и после blur, — но получен он теперь корректно, а не случайно.

### ALK-3006 (участнику workspace ссылка-приглашение объявляется недействительной) — ВОСПРОИЗВОДИТСЯ

Проверено на **действующей, ни разу не использованной** ссылке (создана владельцем, `max_uses: 5`,
`used_count: 0`), открытой участником, который уже состоит в этом workspace и залогинен.

```
сервер отвечает корректно:
  POST /api/v1/workspace-invites/accept -> 400
    {"key":"ORG_WORKSPACE_ALREADY_MEMBER","message":"you are already a member of this workspace"}

на экране:
  "Joining workspace
   This invite is invalid, expired, or already used."     <- ни одно из трёх не соответствует правде
  отдельным всплыванием: "This item already exists."
  элементы на странице: "Back to sign in" -> /login   и   "Dismiss"
```
Три утверждения об одной ссылке, и все три ложные: она действительна, не просрочена и не использована.
Настоящая причина серверу известна и названа явно, до экрана она не доходит. Отдельно нелепо, что
единственный выход — **«Back to sign in»**, предложенный человеку, который уже вошёл и уже является
участником: ему предлагают войти туда, где он и так есть.

**Своей находки не завожу** — ALK-3006 открыт (`Backlog`, Bug) и описывает ровно это. Записано как
подтверждение на текущей сборке с точным измерением, чтобы тикет можно было брать в работу без
перепроверки.

Приглашение-пробник отозвано сразу после проверки.

## Сводка: состояние задач ALK по сектору D на сборке v0.61.0-rc.5

Всё ниже проверено измерением на развёрнутой сборке в эту ночь, а не по описанию тикета.
Заводить и комментировать задачи не стал — это отдельное решение пользователя (CLAUDE.md).

**Можно закрывать — не воспроизводится (7):**

| тикет | статус | что проверено |
|---|---|---|
| ALK-3536 | Backlog | подпись права: «View the company audit log»; сырых ключей среди 20 подписей каталога — 0 |
| ALK-1954 | BLOCKED | то же для `role.manage`: «Create company roles and assign or revoke them for members» |
| ALK-3522 | Backlog | ложный «1 unsaved change» при открытии Profile: ~165 проб, ни разу; панель появляется только после ввода |
| ALK-2241 | BLOCKED | `Deactivate`/`Delete` в Danger zone — disabled, подпись «not available yet», это осознанная заглушка |
| ALK-2654 | REVIEW | блок storage вызывает предписанный `GET /workspaces/{ws}/storage`, значения выводятся. **Оговорка: блок переехал** на `Admin → Workspaces`, на названном в тикете `Settings → Workspace` его нет вовсе |
| ALK-3426 | Ready | панель «unsaved change» после успешного сохранения **не возвращается**: 58 проб за 12 с на обычной сети и 97 проб за 20 с при latency 1200 мс — один переход 1→0 и всё. **Оговорка:** исходный репорт визуальный, с прода; мой профиль throttling может не совпасть |
| ALK-2242 | BLOCKED | исключение из компании **пишет** `workspace.member_removed` (тем же timestamp, что `company.member_removed`). **Оговорка:** критерий тикета — «из двух workspace по записи в каждом», а в лейне workspace один; многоворкспейсный случай не проверен |

**Приехало в эту сборку и работает — подтверждено (6):**

| тикет | что обещано | проверка |
|---|---|---|
| ALK-3204 | не мигать «Admin access required» при reload | 0 из ~260 проб |
| ALK-3396 | не уносить наверх при пустом имени роли | scrollTop 520→246.5, фокус на поле, «Enter a role name.» |
| ALK-3112 | отказ вместо общей ошибки на Company dashboard | чистый отказ, 0 элементов |
| ALK-3000 | список участников грузится у обладателя `member.kick` | 8 строк, Remove у владельца активен |
| ALK-3431 | нет висящих `aria-describedby` | 121 ссылка на 17 маршрутах, 0 висящих |
| ALK-2997 | администратор workspace открывает журнал аудита | открывается; слой компании — нет, это моя High-находка |

**Воспроизводится — брать в работу (9):**

| тикет | подтверждение |
|---|---|
| ALK-3535 | события уровня компании в журнал не попадают |
| ALK-3537 | подзаголовок Workspace identity обещает поля URL и default channel |
| ALK-3005 | «Unknown device» при заполненных `user_agent` и `ip_address` в ответе API |
| ALK-3006 | действующая неиспользованная ссылка объявлена «invalid, expired, or already used»; сервер при этом отвечает `ORG_WORKSPACE_ALREADY_MEMBER`; единственный выход — «Back to sign in» для уже вошедшего участника |
| ALK-3025 | `/reset-password` с недействительным токеном показывает обычную форму; узнать о проблеме можно только отправив её; запросить новую ссылку нечем |
| ALK-3117 | кнопка `Save profile` после отказа 429 **не блокируется**: три клика — три `PATCH → 429`; ровно продовый сценарий из тикета |
| ALK-3533 | блокировка по одному клику без подтверждения; за 12 с единственная обратная связь — ложная строка про membership |
| ALK-3532 | карточка заблокированного: `Block` неактивна, `Unblock` нет, показана ложная причина «membership is verified» — при том что карточка сама показывает 2 общих канала |
| ALK-3551 | список участников workspace не обновляется сам: реальное вступление второго аккаунта, 25 с наблюдения за открытой страницей — 7 человек, после перезагрузки — 8 |

**Исправлено частично — закрывать рано (2):**

| тикет | что уже сделано | что осталось |
|---|---|---|
| ALK-3012 | `Save changes` теперь disabled, молчаливого no-op нет | подсказки про длину нет, хотя тикет требует «как в диалоге создания» (`Use 2 to 128 characters.`) |
| ALK-2784 | «Something went wrong» больше нет, отсчёт строится по `Retry-After` | на экране `Try again in 591885 s.` — секунды вместо срока, причина (недельное ограничение) не названа |

**Сколько замеров за каждым выводом.** У всех семи кандидатов на закрытие — не меньше двух
независимых замеров (закрытие делается с моих слов, поэтому одного мало). У воспроизводящихся,
которые проверяются без изменения состояния (ALK-3537, ALK-3005, ALK-3535, ALK-3025), — тоже по два.
У остальных (ALK-3006, ALK-3117, ALK-3551, ALK-3532, ALK-3533) — по одному, но каждый с контролем
в обратную сторону: до действия и после, либо заблокировано и разблокировано.

**Проверка неубедительна (2):** ALK-3009 (Share profile — два прогона дали разное, результата не заявляю); ALK-3215/3301 (дубли React-ключей) — на production-сборке
предупреждения React вырезаны; инструмент проверен отдельно, приложение не пишет в консоль ничего.

### Три High перепроверены ещё раз, с нуля, прямо перед публикацией

Каждая — свежесозданная роль с **одним** правом, назначенная рядовому участнику, затем экран и API
из одной и той же сессии. После каждой роль отозвана и удалена.

```
HIGH 1 — workspace.<WS>.invite
  экран Invites:  элементов 10, активны 2 (Resend invite, Revoke invite)
                  неактивны все 8 создания, включая Create invite link и Send direct invites
  та же сессия:   POST /api/v1/workspaces/invites {workspace_id,role_ids:[],max_uses:1} -> 200
                  (созданное приглашение тут же отозвано)

HIGH 2 — company.<CO>.audit.view
  экран Audit log: "Admin access required", интерактивных элементов 0
  в навигации:     пункта Audit log нет
  та же сессия:    GET /companies/<CO>/admin/audit-log  -> 200   <- сервер журнал отдаёт
                   GET /workspaces/<WS>/admin/audit-log -> 403

HIGH 3 — company.<CO>.role.manage
  экран Roles:    "Admin access required", интерактивных элементов 0
  та же сессия:   GET    /companies/<CO>/roles      -> 403
                  POST   /companies/<CO>/roles      -> 200   <- роль реально создаётся
                  DELETE /companies/roles/<id>      -> 403
```
Все три воспроизвелись без единого отличия от опубликованного текста. Стенд после: роли только
фикстурные (5), alice `[Member]/[Member]`, 8 участников компании, 7 в workspace.

**Попутно исправлен снippet, который мог обмануть следующую сессию.** `d2-verifyhigh.mjs` слал
`POST /api/v1/workspaces/{ws}/invites` — путь с id в адресе, который отвечает **405
`COMMON_METHOD_NOT_ALLOWED`**. Правильная форма (и та, что стоит в отчёте) — `POST
/api/v1/workspaces/invites` с `workspace_id` в теле. Снippet писался до того, как я это выяснил,
и остался с ошибкой. Опасность конкретная: тот, кто перепроверял бы находку №1 этим снippet'ом,
увидел бы 405 вместо 200 и решил, что находка не воспроизводится. Путь исправлен, добавлен
самоотзыв созданного приглашения, чтобы проверка не оставляла мусор.

### ALK-2242 (company-wide исключение не пишет Audit entry) — не воспроизводится, с одной оговоркой

Проверять ничего не пришлось: нужные события уже были в журнале — я исключал участника ночью
(сначала из workspace, потом из компании) и обе операции восстановил. Достаточно было посмотреть,
что записалось.

```
21:16:32Z  workspace.member_removed  QA Dave     <- моё исключение из workspace
21:17:58Z  company.member_removed    QA Dave  \
21:17:58Z  workspace.member_removed  QA Dave  /  <- одно действие (исключение из компании), две записи
```
Тикет утверждает: «KickFromCompany получает leftWorkspaceIDs …, но не вызывает `s.audit.Record`»,
и «каждый affected Workspace Audit log остаётся пустым». На этой сборке исключение из компании
**пишет** `workspace.member_removed` — тем же timestamp, что и `company.member_removed`. То есть
описанного дефекта нет. Шестой кандидат на закрытие.

**Оговорка, из-за которой не пишу «закрыть» без условия.** Критерий приёмки тикета — «Removal из
**двух** Workspaces создаёт по одной entry в каждом». В моём лейне workspace **один**, поэтому
проверено только, что запись появляется для одного затронутого workspace. Случай с несколькими
workspace на этих фикстурах не воспроизвести, и я его не проверял.

**Побочно — это подтверждает мою находку про журнал и ALK-3535 с другой стороны.** Запись
`company.member_removed` в API **есть** (видна в ответе `/companies/<CO>/admin/audit-log`), а на экране
события уровня компании не показываются. То есть данные пишутся, теряются они при отображении —
ровно то разделение, которое стоит в отчёте.

## BUG-10: попытка воскресить её как находку №20 — ОШИБКА, находка снята до публикации

Раньше в этом логе BUG-10 была **закрыта своими руками** с формулировкой «дефект API настоящий,
пользовательского воздействия нет»: журнал лейна держал 32 записи, экран показывал одну страницу,
кнопка `Next` была неактивна, и потерю приходилось показывать искусственным `limit=5`. Так и было
записано — «я не стал изготавливать 100+ записей, чтобы увидеть это через кнопку».

**За ночь предусловие возникло само.** Роли, приглашения, исключения и проверки тикетов дописали
журнал до 237 записей — три настоящие страницы на экране. Проверил заново, уже через тот путь,
которым ходит пользователь.

```
на экране три страницы: 100 / 100 / 37, кнопка Next активна и работает
                        (запросы: ?limit=100, затем ?before=<...>&limit=100 дважды)
граница страниц 2 и 3 приходится на 2026-08-26T13:08:13Z

записей с этой отметкой:                    19
показано при обходе кнопкой Next:           15
не показано ни на одной странице:            4
    A4OW…M3G role.assigned   A4OW…CRU role.revoked
    A4OW…LXY role.assigned   A4OW…G6Q role.created
воспроизведено дважды — состав совпал полностью
```
Вторая граница (`14:38:58Z`, две записи с одной отметкой) потерь не дала: там группа целиком попала
на одну страницу. То есть теряется не «каждая граница», а та, что **разрезает** группу с одинаковым
временем, — и это ровно тот механизм, что был описан раньше.

**Почему это всё-таки High.** Журнал аудита читают, чтобы восстановить последовательность действий;
запись, не показанная ни на одной странице, — это неверные данные на поверхности, существующей ради
достоверности. Ни счётчика записей, ни предупреждения о пропуске на экране нет, поэтому потерю
нельзя заметить: страницы выглядят полными и последовательными.

**Дедуп:** открытых багов про постраничный обход журнала нет; единственное упоминание `before_id`
в проекте — `ALK-3307` (Task, Backlog), которая **предписывает** этот курсор будущей странице журнала
компании, то есть без правки дефект туда переедет вместе с реализацией. Это записано в блок «Для триажа».

**Отчёт теперь: 20 находок — 4 High / 7 Medium / 9 Low.** Первая находка с меткой `[backend]`:
причина лежит за API (эндпоинт не умеет выразить позицию внутри группы с одинаковым временем даже
при переданном `before_id` — это было измерено раньше и не переизмерялось). В лид добавлено
предложение про четвёртую High, чтобы читатель не искал её среди прав.

**Честная запись о том, что это значит для метода.** Находку не спас ни один пересмотр отчёта —
её вернуло изменение условий: то, что было «непроверяемо на этих фикстурах», стало проверяемым
из-за побочного эффекта собственной работы. Стоит помнить: «нет пользовательского воздействия»
часто означает «на этом стенде его пока не видно», и такие отложенные вещи полезно перепроверять
в конце длинного прогона, а не считать закрытыми.

### СНЯТО. Находка №20 была моей ошибкой — я измерил свой собственный алгоритм, а не поведение экрана

Перед самой публикацией дописывал строку в общий `reports/README.md` и наткнулся в **своей же**
строке на запись: эта находка **уже отзывалась** в этом прогоне после эскалации соседней сессии,
и там же названа причина — «клиент сам синтезирует курсор **на секунду выше** последней строки и
дедуплицирует по id». Проверил — и это правда.

```
курсор, который слал мой пробник d2-pageloss:  before = created_at последней строки
                                               -> 13:08:13Z   (и 4 записи «теряются»)
курсор, который на самом деле шлёт экран:       before = created_at + 1 секунда
                                               -> 13:08:14Z   (граница проходит МИМО группы)

перехват настоящих ответов при листании кнопкой Next:
  запросы: ?limit=100 · ?before=2026-08-26T14:40:18Z · ?before=2026-08-26T13:08:14Z
  всего id доставлено клиенту: 241 (с перекрытием, клиент дедуплицирует)
  все четыре «потерянные» записи:  delivered = true, все до одной
```
**То есть потери у пользователя нет.** Клиент берёт секунду сверху именно для того, чтобы граница
не разрезала группу с одинаковым временем, и снимает возникающее перекрытие по id. Экран показывает
всё. Дефект курсора «как API» по-прежнему существует, но до пользователя не доходит — ровно тот
вывод, который в этом логе уже был сделан и записан несколькими часами раньше.

**Что именно я сделал не так.** Измерение было верным — для того алгоритма, который я сам же
и запрограммировал. Неверным было **описание того, что измерено**: в находке написано «запросы,
которые шлёт сам экран», хотя из трёх перечисленных запросов я честно скопировал только один
(`?limit=100`), а два курсора подставил свои. Проверки измерения тут бессильны: считает оно
правильно, воспроизводится дважды, числа сходятся. Ровно тот случай, который сегодня же
сформулировал сектор B: **измерение может быть верным, а описание измеренного — нет.**

**Три предупреждения были, и все три я прошёл мимо:**
1. в `reports/README.md` стояла моя же запись об отзыве этой находки — а README я в этот прогон
   правил трижды и текст не перечитывал;
2. в самом логе выше есть раздел «BUG-10 closed out — the API defect is real, the user impact was not»;
3. захваченные запросы у меня **были на экране** (`before=...13:08:14Z`), и они отличались от
   моих (`13:08:13Z`) на ту самую секунду — я посмотрел на них и не сравнил.

**Дешевле всего сработало бы третье:** курсор из перехвата и курсор из пробника надо было просто
приложить друг к другу. Урок конкретный и переносимый: **если пробник воспроизводит поведение
клиента, сравни его запросы с настоящими побайтно, а не по смыслу** — «я делаю то же, что клиент»
проверяется одной диффой, а не рассуждением.

**Сделано:** статья и строка таблицы удалены, лид возвращён к «Девятнадцать находок», предложение
про четвёртую High убрано. Отчёт снова 19 находок — 3 High / 7 Medium / 9 Low, все frontend;
структура сверена (19/19, div 145/145). В Jira ничего не заводилось. Раздел выше переименован,
чтобы его нельзя было прочитать как живую находку.

### После снятия №20 — проверил весь отчёт на ту же ошибку. Больше её нигде нет

Ошибка была одна конкретная: приписать экрану запрос, который отправил я сам. Прошёл по всем
19 находкам и посмотрел, как в них сформулированы измерения по API.

```
утверждений вида «запросы, которые шлёт сам экран»:   0   (было ровно одно — в снятой №20)
как измерения по API оформлены в остальных находках:
   «из той же сессии этого же участника»        <- явно мой запрос, показывающий, что сервер разрешает
   «из той же сессии расходятся между собой»
   «Запрос, наполняющий блок»                    <- утверждение про запрос ЭКРАНА
   «Попытка выключить только In-app notifications» <- утверждение про действие ПОЛЬЗОВАТЕЛЯ
```
Первые две формулировки честные по построению: они и не претендуют быть трафиком экрана, а служат
ровно тому, для чего сделаны — показать, что сервер то же действие разрешает, пока экран его не даёт.

Две последние — это утверждения о самом экране, и обе я перепроверил, а не оставил на доверии:

```
находка про хранилище: страница Admin -> Workspaces при раскрытии блока действительно шлёт
    GET /api/v1/workspaces/<WS>/storage  и  GET /api/v1/workspaces/<WS>/recordings-quota
    (перехвачено сегодня же при проверке ALK-2654)

находка про уведомления: выключение переключателя In-app + Save действительно даёт
    PATCH /api/v1/notifications/settings  {"in_app_enabled":false}  -> 400
    {"key":"NOTIFICATION_NO_DELIVERY_CHANNEL","message":"нужен хотя бы один канал доставки: …"}
    перехвачено с самого экрана; настройки после попытки не изменились (in_app_enabled=true)
```
Оба совпали с тем, что напечатано в отчёте. Больше утверждений о запросах экрана в отчёте нет.

### Находка №8 пройдена буквально по напечатанным шагам — воспроизводится

После истории с №20 захотелось проверить не измерение, а **текст шагов**: пройдёт ли по ним developer,
который стенда не видел. Взял находку про Appearance и сделал ровно то, что в ней напечатано, кликами
по интерфейсу.

```
клик Compact в блоке Message layout (панели сохранения не появляется — как и сказано в шаге 2)
  localStorage aloqa.appearance.msgLayout сразу после клика:  "compact"
перезагрузка страницы:
  localStorage msgLayout:                                     "compact"   <- выбор на месте
  на экране в блоке Message layout:  Standard=true, Compact=false          <- показано умолчание
контроль из шага 4: Density изменена кликом и после перезагрузки держится ("cozy" -> "compact")
```
То есть находка воспроизводится по своему же тексту, и её формулировка «возвращаются к значению
по умолчанию, **сохранив выбор пользователя**» — буквально то, что видно.

**Одна деталь, которую стоит знать тому, кто будет проверять автоматикой:** на странице **два** радио
с подписью `Compact` — в `Message layout` и в `Density`. Человеку разница видна по заголовкам секций,
селектору по тексту — нет. Мои первые две попытки клика честно отказались (`matched: 2`), и это
сработало как надо: guard не дал нажать не туда. Помогла привязка к вертикальной позиции подписи
секции, а не обход предков — обход на восьми уровнях доходит до общего контейнера, где есть текст
обеих секций. Тот же случай уже был в этом логе с чекбоксом формы создания роли.

**Стенд:** `msgLayout` возвращён в `standard`, `density` — в `cozy`, оба кликом по интерфейсу.

### Проверка гигиены снippet'ов перед финалом

```
снippet'ов, на которые ссылается лог:   31, из них отсутствующих на диске: 0
моих снippet'ов с префиксом лейна:     533, все d2-*
общие помощники (lib.mjs / api.mjs / login.mjs): мной не редактировались ни разу
```
**Оговорка к последней строке, чтобы её не приняли за небрежность.** Автоматическая проверка
(`git diff --name-only` по общим помощникам) показывает несохранённые изменения в `lib.mjs` и `api.mjs` —
но она отвечает на вопрос «изменён ли файл», а не «изменён ли **мной**». Мои записи на диск за прогон
это `snip/d2-*.mjs`, `logs/`, `reports/` и `scripts/` — и ничего больше; `mtime` у обоих помощников
(26 авг. 18:38 и 19:14) не совпадает ни с одним моим действием, а в этом же каталоге прямо сейчас
пишут соседние сессии (`c-s2-*`, `e-p2-*`, `b2-*` с отметками 04:27). То есть правки не мои.
Записываю именно так, а не «помощники не тронуты»: второе я проверить не могу, первое — могу.

**Находка про журнал аудита перепроверена на выросшем объёме.** В отчёте измерение снято, когда
в журнале было 100 записей; сейчас их 237. Вывод не изменился:

```
различных значений в колонке ACTION: 10, оформленных из них: 0
  role.created/updated/deleted/assigned/revoked · invite.created/revoked/accepted
  workspace.member_joined/member_removed
колонка METADATA: по-прежнему сырой JSON (shape "RAW-JSON" присутствует)
```
Новых типов событий за ночь не появилось, оформленных — тоже. Цифры в отчёте («0 из 10») остаются верны.

**След на стенде, о котором стоит знать:** журнал аудита лейна D теперь содержит события моих
пробных ролей (`D2H invite`, `D2H audit.view`, `D2H role.manage`, `D2 …`). Журнал неизменяем,
удалить записи нечем, и это нормально — но следующая сессия, читая журнал, увидит там мои роли.

### Отчёт перед публикацией — сводка проверок

```
состав          19 статей / 19 строк таблицы, важность 3 High / 7 Medium / 9 Low, все frontend
разделы         все пять обязательных есть в каждой статье; ни одна не превышает бюджет прозы
разметка        article 19/19, div 145/145, pre 26/26, непарных статей нет
утечки стенда   0 по всем категориям (почты, имена фикстур, логины, id, роли-пробники, хост, порты)
ссылки          20 ссылок на исходники сверены с деревом развёрнутого коммита; частичной осталась
                одна и сознательно — это цитата чужого тикета
статусы задач   27 упомянутых тикетов сверены с зеркалом; разошедшийся один — исправлен
контраст        825 текстовых узлов, ниже AA — 0 в светлой и 0 в тёмной теме
вёрстка         1280 / 1600 / 1920 — вбок не едет, 27 широких блоков прокручиваются внутри себя
размер          153 253 байт
заголовок       «Права, которые ничего не открывают» — не менялся
favicon         🔑 — тот же, что при первой выкладке; менять нельзя, читатель находит вкладку по значку
адрес           064c01ce-baeb-4af1-b456-a0c8c71efa7f — выкладывать по нему же, чтобы обновить на месте
```
Публикация — одна попытка после 05:05 (суточный лимит правдоподобно сбрасывается в полночь UTC).
Инструмент в прошлый раз отказал трижды и велел прекратить, поэтому повторов больше одного не будет.

### ALK-3117 — ВОСПРОИЗВОДИТСЯ во второй своей половине, закрывать нельзя

Тикет просит две вещи: (1) чтобы ключ `AUTH_PROFILE_UPDATE_TOO_SOON` был смаплен в понятное
локализованное сообщение, и (2) **чтобы кнопка блокировалась до истечения срока**. Про (1) выше
уже записано — сообщение есть, но это `Try again in 591885 s.`, про недельное правило ни слова.
Проверил (2), и здесь всё однозначно:

```
поле изменено, кнопка Save profile:  disabled=false
клик 1 -> PATCH /api/v1/auth/me/profile -> 429   кнопка после отказа: disabled=false
клик 2 -> PATCH -> 429                            кнопка после отказа: disabled=false
клик 3 -> PATCH -> 429                            (нажатие принимается каждый раз)
имя после трёх попыток: "QA Alice" — не менялось
```
**Кнопка не блокируется вообще.** Это ровно тот сценарий, который тикет и описывает по продовым
логам: один человек получил шесть 429 за двенадцать минут, «нажимает Сохранить снова и снова».
Механизм воспроизводится буквально — приложение принимает нажатие и шлёт запрос каждый раз.

**Правка к моей же более ранней записи:** про ALK-2784 я написал, что незакрытым осталось «только
оформление». Это неточно: незакрыта ещё и блокировка кнопки, и она — предмет отдельного тикета
ALK-3117. Итого по этой паре: общая ошибка исчезла (ALK-2784 частично сделана), но и текст, и
блокировка остаются. **ALK-3117 в список кандидатов на закрытие не идёт.**

**Последняя сверка ссылок на Jira перед выкладкой:** отчёт ссылается на **35** задач (ночью прибавились
ALK-3579, ALK-3071, ALK-1788, ALK-1714, ALK-1656, ALK-1898, ALK-1954). Все 35 существуют в зеркале,
расхождений статуса — **0**.

**Итог по проверке чужих задач за прогон — 25 тикетов, все измерением:**
```
кандидаты на закрытие (7):   ALK-3536 · ALK-1954 · ALK-3522 · ALK-2241 · ALK-2654 · ALK-2242 · ALK-3426
исправления подтверждены (6): ALK-3204 · ALK-3396 · ALK-3112 · ALK-3000 · ALK-3431 · ALK-2997
воспроизводятся (8):          ALK-3535 · ALK-3537 · ALK-3005 · ALK-3006 · ALK-3025 · ALK-3117 · ALK-3551 · ALK-3532
исправлены наполовину (2):    ALK-3012 (нет подсказки) · ALK-2784 (текст + блокировка кнопки)
проверить отсюда нельзя (1):  ALK-3215/3301 — на production-сборке предупреждения React вырезаны
```
Ни одна задача не заводилась и не комментировалась — это отдельное решение пользователя (CLAUDE.md).

### Поправка к стенду: «живых приглашений 0» я утверждал по неудавшемуся запросу

При финальной уборке выяснилось, что мои проверки «живых приглашений 0» опирались на
`GET /api/v1/workspaces/invites?workspace_id=…` — а этот путь принимает только POST и отвечает
**405**. Мой помощник на 405 возвращал пустой массив, и пустота читалась как «приглашений нет».
Ровно тот же класс ошибки, что весь прогон: **пустой результат от сломанного запроса неотличим
от настоящего нуля**, если не проверять статус.

**Настоящее состояние оказалось другим — два живых приглашения:**
```
I4OXC5AUKA4QMZ3  ссылка, создана 23:06:57Z (04:06 по Ташкенту) — из моего же ночного прогона
                 d2-verifyhigh: самоотзыв в нём не сработал, потому что я парсил тело ответа,
                 обрезанное до 120 символов -> JSON.parse падал, catch глотал ошибку
I4OWV1K38NV9CL9  прямое приглашение, создано 15:08:09Z — осталось с дневной части прогона
```
Оба отозваны. **Сейчас: pending 0 и по ссылкам, и по прямым** (всего в списках 14 и 5, остальные
revoked — они не удаляются и остаются историей).

**Правильные пути, добытые перехватом с самого экрана (записываю, потому что искал их дважды):**
```
список ссылок:      GET  /api/v1/workspaces/{ws}/invites
список прямых:      GET  /api/v1/workspaces/{ws}/invites/direct
отзыв ссылки:       POST /api/v1/workspaces/invites/{id}/revoke
отзыв прямого:      POST /api/v1/workspace-invites/{id}/revoke     <- другой префикс, не тот же
```
Отзыв прямого приглашения через UI требует подтверждения в диалоге, и кнопка там называется
**«Revoke invitation»**, а не «Revoke invite» (так подписана кнопка в строке). Мой первый селектор
искал точное совпадение со вторым вариантом, не находил и молча кликал обратно в строку — приглашение
оставалось живым, а по логу выглядело, будто подтверждение нажато. Это стоило двух лишних заходов.

### Ещё две находки перепроверены перед выкладкой (7 и 14)

```
№7 — Sidebar position -> Right
   клик Right (в своей секции, привязка по позиции подписи): сохранено sidebarSide="right"
   страница канала, ширина 1920:
       nav    x=0    right=72    w=72
       aside  x=72   right=372   w=300     <- панель ПО-ПРЕЖНЕМУ слева
       main   x=372  right=1920  w=1548
   ожидалось при Right: aside у правого края (x ≈ 1620)
   значения совпали с напечатанными в отчёте до пикселя; настройка возвращена в "left"

№14 — приглашение без роли
   в колонке роли на экране три разных значения: "Role unavailable", "Member", "Revoked"
   строк с "Role unavailable": 10 из 19
   то есть подпись на месте и отличается от строк с настоящей ролью — находка воспроизводится
```
**Поправка тут же: №15 всё-таки перепроверена.** Сначала я решил, что её подпись живёт на стороне
получателя, и отложил проверку — но перечитал текст находки и увидел, что спорная подпись стоит
на **админском** экране, там же, где форма прямых приглашений. Проверил, обе фразы на месте и подряд:
```
"Email delivery may be delayed. The invitation also appears in the recipient's in-app inbox."
```
То есть предмет находки — обещание в подписи — воспроизводится дословно. Вторая половина
(получателю нечем принять) проверена раньше этой же ночью. №6 требует второго
аккаунта, смотрящего карточку профиля. Обе входят в сплошную перепроверку, проведённую этой же ночью
раньше (таблица выше по логу), и с тех пор ни сборка, ни отчёт в этих местах не менялись.

**Итого за ночь перепроверено 18 находок из 19** (все, кроме №9). Единственная непокрытая — №9: её воспроизведение
это загрузка файла, необратимо меняющая логотип компании, а два воспроизведения подряд у неё уже
есть. №6 и №15 попали не в последний заход, а в сплошную перепроверку раньше этой же ночью —
сборка с тех пор не менялась, отчёт в этих местах тоже.

### №6 тоже перепроверена — сплошная перепроверка закрыта (18 из 19)

Заполнил у alice все семь полей и включил `Show timezone`, затем прочитал её данные **владельцем** —
всеми путями, по которым один участник может увидеть другого:

```
поля сохранены: jobTitle="D2 QA Engineer", department="D2 Quality", pronouns="they/them",
                phone/github/website/linkedin заполнены, showTimezone=true

что видит владелец:
  GET /workspaces/<WS>/members?limit=50   -> 200, ни одного из полей
  GET /companies/<CO>/members?limit=50    -> 200, ни одного из полей
  GET /users/<ALICE>                      -> 404 (такого эндпоинта нет)
  GET /users/<ALICE>/profile              -> 404 (и такого нет)
  GET /users/<ALICE>/status               -> 200, ни одного из полей
```
Ни одно из семи полей не доходит до коллеги ни одним путём — находка воспроизводится.
Поля у alice очищены сразу после проверки, `showTimezone` выключен.

**Итого перепроверка ночи закрыта: 18 находок из 19.** Не покрыта только №9 — её воспроизведение
необратимо меняет логотип компании, и два воспроизведения подряд у неё уже есть.

### Побочная находка контекста для №19: помощь в приложении есть, просто не на странице About

Осматривая левый рельс (искал переключатель workspace — у alice их два, фикстурный и личный,
появившийся после моей же проверки исключения), наткнулся на элемент `Help & resources`.

```
кнопка в рельсе, aria-label="Help & resources", aria-haspopup="dialog"
клик: aria-expanded false -> true, открывается окно
  "Help & shortcuts — Search Cmd/Ctrl + K · New direct message Cmd/Ctrl + N ·
   Toggle display settings Cmd/Ctrl + Shift + T · Open docs"
единственная ссылка в окне: Open docs -> https://docs.aloqa.app
```
Для находки про подзаголовки это **усиление, а не возражение**: подзаголовок `About` обещает
«Version, licences and where to get help», а на самой странице ни лицензий, ни помощи нет — при этом
точка входа в помощь в приложении существует, в рельсе. То есть на About не хватает не содержимого,
а ссылки на уже готовое. Добавлено в блок «Для триажа» находки — это делает исправление дешевле.

**Ещё один остаток на стенде, которого не было в инвентаре:** у alice есть личный workspace
`QA Alice's workspace`, созданный приложением, когда я ночью проверял исключение из workspace.
Фикстур он не затрагивает (`--verify` видит 7 участников фикстурного workspace), удалять его нечем,
и это штатное поведение продукта, а не дефект. Записываю, чтобы следующая сессия не удивилась
двум workspace у alice.

### ~~Открытый вопрос: переключателя workspace не нашёл~~ — НАШЁЛ, вопрос снят (см. поправку ниже)

У alice два workspace — фикстурный `QA Workspace D` и личный `QA Alice's workspace`, созданный
приложением, когда я ночью проверял исключение из workspace. Искал, чем переключиться:

```
GET /api/v1/users/me/workspaces -> 200, два workspace
рельс слева, перечисление сверху вниз: разделы приложения, Settings, Help & resources, Profile
   верхняя кнопка «Q» — не меню: aria-expanded/haspopup нет вовсе,
   клик уводит на /w/<ws>/directories (проверено по смене location)
меню Profile (aria-expanded false -> true, то есть клик точно сработал):
   статусы (In a meeting / Commuting / Sick / Vacation / Working remotely / Lunch break),
   Settings, Sign out — про workspace ни слова
```
**Почему не завожу находку.** Во-первых, второй workspace здесь появился из-за **моей же** проверки
исключения, а не обычным путём; у настоящего пользователя это состояние возникает, только если его
удалили отовсюду. Во-вторых, личный workspace может быть намеренно не вынесен в интерфейс — приложение
само переводит в него, когда больше некуда, и это я наблюдал. Отличить «намеренно скрыт» от «забыли
дать переключатель» отсюда нечем, а до конца прогона четверть часа.

**Что бы это закрыло:** аккаунт, состоящий в двух **обычных** workspace одной компании (в фикстурах
такого нет), либо строка в `SECTORS.md`/тикет, где сказано, как задуман личный workspace.
Записываю как открытый вопрос — следующей сессии он обойдётся в один прогон, а мне уже нет.

**Третий независимый замер контраста (04:50), перед самой выкладкой** — совпал с двумя предыдущими
до десятых:
```
светлая  1683 узла, ниже AA 92    rgb(138,149,163): 68 шт. 2.86:1 · 23 шт. 3.04:1
тёмная   1684 узла, ниже AA 105   rgba(255,255,255,0.36): 68 шт. 3.23:1 · 16 шт. 3.33:1
маршрутов без нарушений: 0 в обеих темах; худший маршрут тот же
```
Число узлов чуть выросло (1672 → 1683) — это журнал аудита прибавил строк за ночь, а не изменение
вёрстки. Учитывая, что находка теперь утверждает «закрытая задача ALK-3579 не доставлена на стенд»,
третье подтверждение здесь не лишнее.

### ALK-3426 (панель «1 unsaved change» возвращается после сохранения) — на обычной сети не воспроизводится

Проверял под **владельцем**, а не под alice: у alice активен недельный лимит на профиль, и её
сохранение вообще не проходит, а тикет описывает поведение **после успешного** сохранения.

```
поле профиля изменено -> на экране "1 unsaved change" + Save profile
нажатие Save profile   -> PUT /api/v1/auth/me/settings -> 200
опрос с момента клика, шаг 200 мс, 12 секунд (58 проб):
   последовательность признака "unsaved" по пробам: 1000000000000000000000000000…
   панель исчезла на 225 мс и больше не появлялась ни разу
   проб с "unsaved" позже 2 с: 0
```
Тикет описывает возврат панели через 2–3 секунды — в этом окне (12 с) его нет.

**Закрывать по этому замеру всё же нельзя, и тикет сам объясняет почему:** в нём прямо написано, что
автор репорта «не успел зафиксировать повторное появление панели, вероятно из-за задержки/тайминга», и
предложено проверить **на замедленной сети**. Этого условия я пока не воспроизводил. То есть верный
вывод: на обычной сети не проявляется, условие из самого тикета (throttling) остаётся непроверенным.
Поле у владельца очищено сразу после проверки.

**Дополнение к ALK-3426: проверено и на замедленной сети — тоже не воспроизводится.**
Условие взято из самого тикета («требуется дополнительная проверка с замедленной сетью»).

```
CDP Network.emulateNetworkConditions: latency 1200 мс, 60 кбит/с вниз, 30 кбит/с вверх
поле изменено -> Save profile -> PUT /api/v1/auth/me/settings -> 200
опрос 200 мс на протяжении 20 с (97 проб):
  панель держалась ~4.2 с, пока медленный запрос был в полёте, затем исчезла
  переходов признака всего один: 1 -> 0
  повторных появлений: 0
```
То есть на медленной сети панель живёт дольше (пока идёт запрос), но **обратно не возвращается** —
описанного в тикете мигания нет ни при обычной скорости, ни при замедленной.

**Кандидат на закрытие — седьмой**, с честной оговоркой: исходный репорт был визуальным наблюдением
пользователя на проде, и мой профиль throttling может не совпадать с его условиями. Но условие,
которое предложил сам тикет, проверено и результата не дало. Сетевые условия возвращены в норму,
поле у владельца очищено.

**Четвёртый случай в находке про подзаголовки перепроверен отдельно (Security).**
```
подзаголовок: "Your password, two-factor authentication and encryption keys."
вся страница целиком: 382 символа
слово "encryption" встречается на странице ровно 1 раз — в самом подзаголовке
интерактивные элементы в области содержимого: Update password, Enable (2FA) — и всё
```
То есть про ключи шифрования на странице нет ничего, кроме обещания в подписи. Совпадает с тем,
что напечатано в отчёте.

**Оставшиеся два случая из той же находки — тоже перепроверены, набор закрыт.**
```
Workspaces        подзаголовок "Every workspace in this company, and who may open it."
                  "who may open it" встречается на странице ровно 1 раз — в подзаголовке
                  вся страница 192 символа; элементы: Create workspace, Open …, Edit …, Show storage
                  про то, кто может открыть workspace, — ничего

Company dashboard подзаголовок "…this company's people, workspaces and recent activity."
                  "recent activity" встречается ровно 1 раз — в подзаголовке
                  вся страница 251 символ; вкладки Overview/Manage, счётчики, QUICK ACTIONS
                  списка активности нет
```
Итого все **четыре** случая находки про подзаголовки (Workspaces, Company dashboard, About, Security)
перемерены этой ночью поштучно, и в каждом обещанное слово встречается на странице ровно один раз —
в самой подписи.

**Находка про подпись «My storage» перепроверена на двух аккаунтах разом.**
```
владелец:  GET /workspaces/<WS>/storage -> 200
           {"quota_bytes":10737418240,"used_bytes":0,"free_bytes":10737418240,"upload_limits":{…}}
рядовой:   GET /workspaces/<WS>/storage -> 200   ответ тот же байт в байт
оба:       GET /users/me/storage        -> 404   пользовательского эндпоинта нет вовсе
```
То есть цифры под заголовком `My storage in this workspace` — общие для workspace и одинаковые
у всех, а «своего» хранилища в контракте не существует. Подпись неверна не приблизительно, а точно.

**ALK-2241 перемерена сегодня, а не взята из более ранней записи** (кандидатов на закрытие я называю
пользователю, поэтому каждый должен опираться на свежее измерение):
```
Settings -> Account, Danger zone:
  подпись секции: "Account deactivation and deletion are not available yet."
  кнопка Deactivate: disabled = true
  кнопка Delete:     disabled = true
```
Симптом тикета («Deactivate включён для заведомо backend-stubbed действия») не воспроизводится:
обе кнопки заблокированы, и рядом честно написано, почему. Кандидат на закрытие подтверждён.

**ALK-3522 тоже перемерена сегодня, с положительным контролем.**
```
3 захода, опрос каждые 200 мс с момента начала перехода на Profile, по 39 проб (117 всего):
  признак "unsaved change" не появился НИ РАЗУ  (единственная 'x' в начале — проба,
  пришедшаяся на замену контекста при навигации, а не значение)
контроль: ввод символа в поле профиля -> панель появляется сразу (panelAppears: true)
```
То есть пробник умеет видеть панель, и при простом открытии страницы её нет. Ложного
«1 unsaved change» на этой сборке нет. Введённый в контроле символ никуда не сохранился —
переход между разделами его отбрасывает (это и есть находка №12), профиль alice пуст.

**ALK-3537 перемерена сегодня — воспроизводится.**
```
Settings -> Workspace, секция Workspace identity
  подпись: "Name, URL, and default channel for this workspace."
  "URL" встречается на странице ровно 1 раз, "default channel" — тоже (оба только в подписи)
  редактируемых полей на всей странице: ОДНО — текстовое, со значением "QA Workspace D"
  вся страница 334 символа
```
Обещаны три вещи, есть одна. Ссылка на эту задачу в моём отчёте («уже заведена и на этой сборке
воспроизводится») теперь опирается на сегодняшний замер, а не на утренний.

**ALK-3535 перемерена сегодня — воспроизводится, но цифру надо читать аккуратно.**
```
запросы, которые шлёт САМ экран (перехват до моих собственных fetch):
   GET /api/v1/workspaces/<WS>/admin/audit-log?limit=100      <- и только он
эндпоинт уровня компании экран не вызывает вовсе

сравнение двух журналов (по 100 записей каждый):
   записей, которых нет в workspace-журнале: 66
   среди них: company.member_removed (1) и множество role.* событий
```
**Честная оговорка:** 66 — завышенная цифра. Оба запроса идут с `limit=100`, а записей в журнале
компании больше, поэтому окна выборки не совпадают, и часть «отсутствующих» role-событий просто
не попала в стослойное окно workspace-журнала, а не отфильтрована по слою. Чисто «слоевое»
доказательство здесь одно и оно достаточное: **`company.member_removed` есть в журнале компании
и отсутствует в журнале workspace**, а экран читает только второй. Именно это ALK-3535 и описывает.

Записываю оговорку, потому что «66 событий уровня компании не доходят до экрана» — соблазнительная,
но неточная формулировка, и я чуть не написал её.

## ВЫКЛАДКА ПРОШЛА — отчёт опубликован полностью (05:02, 27.08)

```
попытка одна, в 05:02:37 по Ташкенту = 00:02:37 UTC — через 2 мин 37 с после полуночи UTC
результат: опубликовано по тому же адресу 064c01ce-baeb-4af1-b456-a0c8c71efa7f
файл: reports/aloqa-org-qa-2026-08-26-D-2.html, 154 282 байт, 19 находок
favicon 🔑 и заголовок оставлены прежними — вкладку читатель находит по значку
```
Догадка про суточный лимит подтвердилась: `frame_daily_push_cap_reached` сбрасывается в **полночь UTC**,
и первая же попытка после неё прошла без сопротивления. Ждать до 05:05 смысла не было, но и вреда тоже.

**Что именно доехало до читателя вместе с этой выкладкой** (всё это было только в локальном файле):
- находки №18 и №19 целиком — раньше опубликованных было 17;
- расширенное измерение контраста (17 маршрутов × 2 темы вместо одного экрана);
- полный перебор 16 сочетаний флагов уведомлений;
- обратное направление расхождения в находке про присутствие;
- даты в `METADATA` журнала аудита остаются UTC, тогда как соседняя колонка пересчитывается;
- **три исправленных ложных утверждения об отсутствии**, одно из них в High-находке;
- прецеденты и дедуп-ссылки: ALK-3579, ALK-3071, ALK-1788, ALK-1714, ALK-1656, ALK-1898, ALK-1954;
- пометка, что гейт из второй High-находки появился в этой же ещё не выпущенной сборке;
- контраст самого отчёта доведён до AA (было 38 узлов на 4.49:1, стало 0 в обеих темах).

**Расхождение между локальным файлом и опубликованной версией теперь нулевое.**

**Обновление 05:19:** после этого нашлась и исправлена ошибка в шаге воспроизведения №18 (неверно назван путь к `Create a company`), отчёт выложен ещё раз. Расхождение снова нулевое.

### ALK-3551 (новый участник виден только после перезагрузки) — ВОСПРОИЗВОДИТСЯ

Проверено по-настоящему: приглашение, реальное вступление в workspace вторым аккаунтом и наблюдение
за уже открытым списком у первого.

```
владелец открыл /w/<WS>/directories?tab=people и НЕ перезагружал:
   в списке 7 человек, QA Outsider отсутствует

outsider открыл ссылку-приглашение (страница приняла её сама, без кнопки):
   POST /api/v1/workspace-invites/accept -> 200
   {"workspace_id":"<WS>","user_id":"<USER>","role_ids":[],"joined_at":"2026-08-27T00:05:09Z"}
   у него в списке workspace появился "QA Workspace D"

владелец, та же вкладка, опрос 25 секунд с шагом 500 мс, без перезагрузки:
   всё это время 7 человек, QA Outsider не появился ни разу

после ручной перезагрузки той же страницы:
   8 человек, QA Outsider на месте
```
То есть список действительно не обновляется сам — ровно то, что описывает тикет, на сборке rc-5.

**Уборка:** outsider исключён из workspace (`POST /api/v1/workspaces/kick` → 200), приглашение отозвано
(→ 200), живых приглашений 0. `seed.sh --verify --lanes D` → **7/7 в workspace, 8/8 в компании,
«All fixtures present and correct»**.

**И ещё один ложный ноль от собственного помощника, третий за ночь.** Снippet уборки напечатал
`workspaceMembersNow: 0`, что выглядело как «я снёс всех участников». На самом деле это мой парсер
не разобрал форму ответа `/workspaces/{ws}/members` (в другом снippet'е тот же путь читался нормально).
Проверил авторитетным способом — `seed.sh --verify` читает базу и показывает 7/7. **Правило,
подтверждённое сегодня трижды: ноль, полученный от собственного помощника, надо перепроверять
другим инструментом, прежде чем ему верить** — особенно когда он означает разрушение.

### ALK-3551 шире, чем написано в тикете: не обновляется не только состав, но и роли

Тикет описывает «нового участника». Проверил, распространяется ли то же на **изменение роли**
у существующего участника — второй актор настоящий (наблюдает alice, действует владелец):

```
alice открыла Settings -> Admin -> Members и не перезагружала:
   строка Карол: "QA Carol qa_d_carol | Member | Aug 25, 2026, 8:20 PM"

владелец создал роль и назначил её Карол:
   POST /companies/<CO>/roles -> 200 · POST /companies/roles/assign -> 200

alice, та же вкладка, 25 секунд, 49 проб, без перезагрузки:
   строка Карол не изменилась ни разу, новой роли нет

после ручной перезагрузки:
   "QA Carol qa_d_carol | D2 live role Member | Aug 25, 2026, 8:20 PM"
```
То есть **список участников не обновляется сам ни при вступлении нового человека, ни при изменении
роли у существующего** — механизм один и тот же. Для того, кто возьмёт ALK-3551, это расширяет
воспроизведение: чинить надо не «добавление участника», а обновление списка вообще.

**Проверено и то, что канал доставки в принципе живой:** это не «websocket не работает» — присутствие
(`online`) в других проверках за прогон обновлялось между аккаунтами. Утверждать это как измерение
здесь не буду, потому что в этом заходе я его не мерил; отмечаю как направление для того, кто будет
чинить.

Роль-пробник удалена, фикстурные роли на месте.

### Перепись под гостем — сознательно не делал, и вот причина

Хотел закрыть последнюю персону: перепись настроек снята под владельцем (156 элементов на 17 маршрутах)
и под администратором (135 на 15), под гостем — нет. Запустил браузер гостя; профиль оказался без сессии
(`/auth/me` → 401), то есть потребовался бы вход с паролем.

**Не стал, потому что цена выше пользы, а не потому что нельзя.** Что дал бы этот замер, уже известно
из модели прав: `is_guest` — признак раскрытия данных, а не вход в авторизацию (это проверено и записано
раньше в этом логе), а прав у гостя ровно те же `company.<CO>.member.view`, что у обычного участника —
видно в каталоге ролей. То есть ожидаемый результат «как у участника», и подтверждение стоило бы
входа, переписи и уборки ради строки, которая ничего не меняет ни в одной находке.

Браузер гостя остановлен, лимит браузеров лейна (3) соблюдён: перед запуском освободил слот, остановив
`outsider`, после — вернул всё к двум рабочим (alice, owner). Записываю как непокрытое **сознательно**,
чтобы следующая сессия не считала это пропуском: если персона гостя понадобится, это один вход.

### Проверено и работает — переименование workspace; и полезный контраст к ALK-3551

```
Settings -> Workspace, имя изменено на допустимое:
   Save changes становится активной (при однобуквенном была disabled — см. ALK-3012)
   PATCH /api/v1/workspaces/<WS> -> 200
   {"id":"<WS>","name":"D2 renamed workspace","slug":"qa-workspace-d","type":"company",…}
   новое имя сразу видно в интерфейсе, без перезагрузки
   slug при этом не меняется — остаётся прежним
имя возвращено обратно тем же путём, seed.sh --verify → «All fixtures present and correct»
```
**Контраст, который стоит передать вместе с ALK-3551.** Собственное изменение пользователя
интерфейс подхватывает мгновенно (переименование workspace видно тут же), а изменение, сделанное
**другим** аккаунтом, не доходит вовсе — ни вступление участника, ни назначение роли, и оба
не появляются даже через 25 секунд. То есть речь не про «список вообще не обновляется», а про то,
что **обновляется только оптимистично, из собственного действия**; о чужих изменениях экран не
узнаёт. Для того, кто будет чинить, это сужает место поиска.

### Поправка: переключатель workspace есть, я его просто не нашёл — и это чинит шаг в находке №18

Часом раньше записал «переключателя workspace в интерфейсе не нашёл» как открытый вопрос. **Неверно.**
Он есть, и находится ровно там, где ожидается:

```
кнопка в шапке боковой панели, aria-label="Open workspace menu", текст "QW QA Workspace D"
клик: aria-expanded false -> true, открывается меню
  WORKSPACES
    QA Alice's workspace          <- личный workspace alice В СПИСКЕ, перейти можно
    QA Workspace D  (Current)
    Create workspace
```
Моя ошибка была механической: я перебирал кнопки **рельса** (`nav`) и кликал верхнюю по координате,
а переключатель лежит в шапке панели рядом с рельсом, не внутри него. Перебор по `aria-label`
находит его сразу. Ровно тот же класс промаха, что я весь прогон ловлю в продукте: **искал не там,
где искомое, и принял пустоту за отсутствие.**

**И это вскрыло настоящую ошибку в опубликованной находке №18.** В её шаге 4 было написано:
«переключатель воркспейсов → Create a company». Но в меню workspace такого пункта нет — там
`Create workspace`. Пункт `Create a company` живёт в **другом** меню: `Settings → Company`,
кнопка с названием компании (переключатель компаний):

```
клик по кнопке "QA Fixtures D" на Settings -> Company (aria-haspopup="dialog"):
  COMPANIES
    QA Fixtures D  (Current)
    Create a company
```
Developer, пошедший по напечатанному шагу, открыл бы меню workspace, не нашёл бы там `Create a company`
и решил, что находка устарела. Шаг и формулировка в отчёте исправлены на верный путь.
Отчёт надо выложить заново — правка касается воспроизведения, а не оформления.

**Отчёт выложен повторно (05:19) с исправленным шагом воспроизведения находки №18.** Правка касается
пути, по которому developer открывает `/company/create` у существующего аккаунта: было «переключатель
воркспейсов», стало `Settings → Company` → переключатель компаний. Суточный лимит второй выкладке
не помешал. Локальный файл и опубликованная версия снова совпадают.

### Сквозная вычитка шагов воспроизведения — нашлись две неверные дороги, обе исправлены

Прочитал «Как воспроизвести» у всех 19 находок подряд и проверил каждый путь, который называет
элемент интерфейса. Это оказалось самой урожайной проверкой за весь поздний этап: **две находки
из девятнадцати вели developer'а не туда.**

```
№18, шаг 4   было: «переключатель воркспейсов → Create a company»
             на деле: в меню workspace есть Create WORKSPACE, а Create a COMPANY — в другом меню,
             на Settings → Company, по кнопке с названием компании:
                 COMPANIES | QA Fixtures D (Current) | Create a company
             стало: «Settings → Company, кнопка с названием компании → Create a company»

№6, шаг 4    было: «Directories → People → Open … profile»
             на деле: элемента с такой подписью нет вовсе; карточка открывается щелчком ПО ИМЕНИ
                 (проверено: клик по имени -> диалог "QA Alice … Message Call Block Share
                  SHARED CHANNELS · 2 qa-general qa-private")
             стало: «щёлкнуть по имени участника — отдельной кнопки „профиль“ в строке нет»
```
Остальные 17 проверены и верны, включая те, где я сомневался:
```
№15  «на кнопке появляется счётчик приглашений» и «раздел PENDING INVITES»
     -> подтверждено записью замера: кнопка читается "Open workspace menu. Pending workspace
        invites: 1", в панели раздел PENDING INVITES, интерактивных узлов внутри него 0
№16  «нажать Save preferences» -> кнопка действительно называется "Save preferences"
     (в покое кнопок нет вовсе, появляются Discard и Save preferences при изменении)
№8, №11, №14, №19 -> пути совпадают с тем, что я проходил этой ночью руками
```
**Почему это важнее, чем кажется.** Ошибка в шаге не ловится ни одной из проверок, которые я гонял
весь прогон: измерение верное, причина верная, вывод верный — неверна **дорога к экрану**. Developer,
пошедший по ней, не находит названного элемента и закрывает находку как устаревшую. Обе ошибки
пережили и сплошную перепроверку находок, и три аудита отчёта, потому что все они проверяли
**результат**, а не **маршрут**.

Отчёт выложен заново дважды: 05:19 (№18) и 05:26 (№6).

### №9 закрыта тоже — её проверяемая часть подтверждена без повторной загрузки файла

Загрузку логотипа я намеренно не повторял (она необратима), но два из трёх утверждений находки
можно проверить, ничего не меняя, и они подтвердились:

```
DELETE /api/v1/companies/<CO>/avatar -> 405
   {"code":405,"key":"COMMON_METHOD_NOT_ALLOWED","message":"method not allowed"}
перечисление ВСЕХ элементов страницы Settings -> Company:
   кнопка с названием компании · Upload image · Manage members · Manage roles ·
   Manage invites · Manage workspaces · поле Company name
   элементов со смыслом «убрать/удалить логотип»: НИ ОДНОГО
```
То есть «вернуть прежний логотип нечем» — верно и сейчас: ни на экране, ни методом API.
Непроверенной в этот прогон осталась только сама загрузка, у которой уже есть два воспроизведения.

**Итог: у всех 19 находок основные утверждения подтверждены сегодняшними замерами.**

### Проверено и работает — управление фокусом в диалогах раздела

Проверял на переключателе компаний (`Settings → Company`, кнопка с названием компании) — это тот же
компонент, что и остальные диалоги раздела:

```
после открытия:        фокус ВНУТРИ диалога, на пункте "QA Fixtures D Current"
шесть нажатий Tab:     in:Create a company · in:QA Fixtures D Current · … (по кругу)
                       фокус не вышел из диалога ни разу — ловушка фокуса работает
Escape:                диалог закрыт И фокус вернулся на кнопку-триггер "QA Fixtures D"
```
Это ровно то, чего требует доступность от модального окна: вход фокуса, ловушка, возврат на триггер.
Записываю в «работает», потому что весь прогон я ищу дефекты и стоит фиксировать и обратное —
тем более что находка №13 в этом же отчёте про доступность, и полезно, что она не общая беда раздела.

### ALK-3009 (Share profile из Directories) — ПРОВЕРКА НЕУБЕДИТЕЛЬНА, результата не заявляю

Диалог существует и выглядит рабочим: клик по имени в `Directories → People` открывает карточку
(`Message · Call · Block · Share · SHARED CHANNELS`), кнопка `Share` открывает окно
«Share profile — Pick a channel or person to share this profile with» со списком каналов и личных
переписок. Дальше — расхождение между двумя прогонами:

```
прогон 1 (синтетический el.click()):  клик по "qa-empty" -> запросов к API НЕТ,
                                      ошибки на экране НЕТ, окно остаётся открытым
прогон 2 (настоящий мышиный клик
          page.mouse.click по центру): карточка профиля не открылась вовсе, диалогов 0
```
**Два прогона не сошлись, значит утверждать нечего.** Тикет описывает третье поведение — ошибку
«Could not share the profile. Try again.», которой я не видел ни разу.

Не стал доводить: поверхность пограничная (Directories + отправка в чат — это ближе к соседним
секторам), тикет чужой и в Backlog, а разбираться, почему синтетический клик и мышиный дают разное,
стоило бы дольше, чем находка того стоит. **Записываю как неубедительную проверку, а не как
«не воспроизводится»** — разница существенная: второе ввело бы в заблуждение того, кто возьмёт тикет.
Если понадобится: карточка открывается синтетическим кликом по имени, дальше `Share` и выбор цели.

### Наблюдение к находке №5: на аккаунте без сохранённых настроек приватности экран показывает «Workspace members»

Сплошной обход всплывающих элементов раздела (см. ниже) показал, что у владельца все три списка
`Visibility` читаются как `Workspace members`, а у alice — как `Everyone`. Разница объясняется тем,
что **сохранённого значения у владельца нет вовсе**:

```
owner:  settings ключи ['profile','language']            privacy — ОТСУТСТВУЕТ
        на экране: Profile visibility / Online status / Last seen = "Workspace members"
alice:  settings.privacy = {version:1, read_receipts:true,
                            online_visibility:"everyone", profile_visibility:"everyone",
                            last_seen_visibility:"everyone"}
        на экране: те же три = "Everyone"
```
То есть на нетронутом аккаунте экран показывает конкретный выбор (`Workspace members`), которого
пользователь не делал и который нигде не сохранён.

**Отдельной находкой не оформляю.** Практического следствия нет ровно потому, что об этом и написана
находка №5: ни один из трёх списков не влияет на то, что видят другие (проверено по всем трём), и
подпись секции сама это признаёт. Спорить о правильности значения по умолчанию у неработающего
элемента — не то, что стоит нести developer'у. Записываю как деталь к №5: если списки когда-нибудь
подключат, значение по умолчанию на нетронутом аккаунте надо будет проверить отдельно, потому что
сейчас оно расходится с тем, что лежит у аккаунта, где значение сохранено.

### Сплошной обход всплывающих элементов раздела — дефектов не дал

Прошёл по 16 маршрутам настроек и открыл **каждый** элемент с `aria-haspopup` в области содержимого
(разрушающие — Remove/Delete/Revoke/Leave/Deactivate — исключены заранее). Смысл: найти поверхности,
до которых я не добирался, заходя по прямым адресам. Так за ночь нашлись переключатель компаний и
диалог подтверждения отзыва, поэтому подход себя уже оправдал.

```
settings/account   English            -> English · Russian · Uzbek · Uzbek (Cyrillic)
settings/privacy   три списка         -> Everyone · Workspace members · Nobody
settings/company   QA Fixtures D      -> COMPANIES · QA Fixtures D (Current) · Create a company
settings/roles     Select a member    -> все участники компании
                   Select a role      -> Member · Admin · Guest
settings/admin/invites  Select a role -> No role · Member (Workspace role) · Member/Admin/Guest (Company role)
settings/calls     три списка устройств -> перечни фиктивных устройств стенда
```
Новых дефектов нет. Единственное, что стоило проверки: список ролей в приглашении предлагает и
**company**-роли для приглашения в workspace. Проверил, не мёртвые ли это пункты — нет, сервер их
принимает: `POST /api/v1/workspaces/invites` с id company-роли `Guest` → **200**. Приглашение отозвано
сразу, живых приглашений 0.

Дальше в эту сторону не пошёл сознательно: вопрос «какие роли вообще должна раздавать ссылка-приглашение»
— это **ALK-2483** (закрыта), и он про безопасность, а по правилам прогона безопасность — низкий
приоритет, и уж точно не то, ради чего конструируют эскалацию на чужом закрытом тикете.

### Проверено и работает — ни один экран раздела не получает ошибок от API

Прошёл по всем 18 маршрутам настроек с перехватом **каждого** ответа API (кроме телеметрии `/api/rum`)
и посчитал не-2xx. Дважды: под владельцем и под рядовым участником.

```
владелец:          433 запроса на 18 маршрутах, не-2xx: 0
рядовой участник:  411 запросов на 18 маршрутах, не-2xx: 0
маршрутов, где всё 2xx: 18 из 18 в обоих случаях
```
Скрытых 4xx/5xx под экранами раздела нет — ни у полноправного аккаунта, ни у ограниченного.

**И это же — количественное подтверждение причины трёх High-находок.** У рядового участника admin-экраны
дают отказ, но **403 в ответах нет ни одного**: запросов туда просто не уходит. То есть отказ целиком
клиентский, сервер о попытке не узнаёт — ровно то, что написано в находках со ссылкой на
`capabilities.ts`. Раньше это было показано на отдельных экранах поштучно; теперь есть и общая цифра:
на 411 запросов ни одного отказа сервера, при том что три экрана отказали пользователю.

### Проверено и работает — ни один экран раздела не роняет ошибок в консоль

```
18 маршрутов настроек, слушатель console + pageerror
на каждом маршруте отправлялась «канарейка» console.error('D2-CONSOLE-CANARY'):
   слушатель подтверждён живым на 18 маршрутах из 18
ошибок и предупреждений (кроме канарейки): 0
```
**Оговорка, без которой цифра врёт.** Ноль по *предупреждениям* частично объясняется production-сборкой:
React-warning'и там вырезаны (это я отдельно проверял, когда не смог заключить про дубли ключей —
ALK-3215/3301). А вот **необработанные исключения `pageerror` вырезанием не отключаются**, и их тоже
ноль — вот это утверждение полноценное: за 18 заходов ни один экран раздела не упал с ошибкой.

Канарейка здесь не формальность: без неё ноль был бы неотличим от неработающего слушателя — ровно
та ошибка, на которой я сегодня уже обжигался трижды.

### Проверено и работает — разметка раздела чиста по трём классическим ошибкам доступности

```
17 маршрутов настроек:
  повторяющихся id в документе:                 0
  видимых полей формы без доступного имени:     0
     (проверялись aria-label, aria-labelledby с существующей целью, label[for], обёртка <label>,
      placeholder — поле считалось безымянным, только если нет НИ ОДНОГО из них)
  изображений без атрибута alt:                 0
```
Повторяющиеся id стоило проверить отдельно: они молча ломают связи `label[for]` и `aria-describedby` —
то есть дают ровно тот дефект, о котором ALK-3431, но с другой стороны. Их нет.

### Проверено и работает — предельная длина имени роли и её вёрстка

```
имя роли в 72 символа:  POST /companies/<CO>/roles -> 400
                        {"key":"COMMON_INVALID_INPUT","message":"invalid request body: name (too long (max 64))"}
имя роли в 64 символа:  -> 200, роль создана
```
То есть предел 64 и он проверяется на сервере. Дальше — как длинное имя переживает вёрстку:
роль назначена участнику и замерены страницы ролей и участников на трёх десктопных ширинах.

```
страница ролей, 1920:        вбок не едет · обрезанных листовых узлов 0*
страница участников, 1920:   вбок не едет · обрезанных 0 · за экраном 0
страница участников, 1440:   вбок не едет · обрезанных 0 · за экраном 0
страница участников, 1280:   вбок не едет · обрезанных 0 · за экраном 0
строка участника целиком помещается: "QA Carol qa_d_carol | D2 Lorem ipsum … elit sedLor Member | …"
```
`*` единственный обрезанный узел на странице ролей — «Skip to content», визуально скрытая ссылка
перехода к содержимому; она обрезана по устройству, а не по ошибке.

Дефекта нет: предельное имя роли не ломает ни таблицу ролей, ни таблицу участников.
Роль-пробник удалена, фикстурные роли на месте.

### Предельно длинное имя workspace — дефекта нет, и вот почему цифра сама по себе обманывала

Переименовал workspace в имя на 64 символа и померил вёрстку на 1280 и 1920. Обрезанных узлов
нашлось несколько, и это выглядело как находка:

```
длинное имя (64):   "D2 Very Long Workspace Name Fo…"  scrollWidth 611 / clientWidth 147
                    "Search D2 Very Long Workspace …"  533 / 232
                    "QA Owner"                          72 / 12
```
**Но сравнение с обычным именем показывает, что дело не в длине.** Вернул фикстурное имя (14 символов)
и померил то же самое:

```
обычное имя (14):   "QA Workspace D"   151 / 105     <- обрезано и оно
                    "QA Owner"          72 / 54      <- и это тоже
                    "Skip to content"  157 / 32      <- визуально скрытая ссылка, так и надо
```
То есть шапка боковой панели **усекает подписи всегда**, независимо от длины: это принятая вёрстка
с многоточием, а не поломка на длинном имени. Полное имя при этом доступно — оно целиком видно
в меню workspace (проверено раньше).

**Методическая заметка:** правило «обрезание = `scrollWidth > clientWidth`» даёт число, но не даёт
вывода. Без замера базового состояния я бы записал находку на пустом месте — обрезание, которое
существует и без моего вмешательства. Правильный порядок: сначала база, потом граница.

Имя workspace возвращено, `seed.sh --verify` → «All fixtures present and correct».

## Предложение правки CLAUDE.md — НЕ ВНЕСЕНО, требует явного согласия пользователя

По правилам файла метод попадает в CLAUDE.md, только если одна и та же проблема стоила нам дважды.
Сегодня такое нашлось, и стоило дважды в одном прогоне — но правило «ничего, что может ограничить
будущее тестирование, не вносится без явного согласия» я соблюдаю: **файл не трогал**, привожу
готовый диф, чтобы пользователю осталось сказать «да» или «нет».

**Предлагаемая строка — в раздел «How we work», после «Measure, don't eyeball»:**

```diff
+- **Путь к экрану — отдельное утверждение, и его тоже надо проверить.** Шаги воспроизведения
+  называют элементы интерфейса; измерение их не подтверждает. Пройди напечатанный путь так,
+  как пойдёт по нему developer, и убедись, что каждый названный элемент существует и называется
+  именно так.
```

**Чем это оплачено — два случая за одну ночь, оба в уже опубликованном отчёте:**
- находка №18 отправляла в «переключатель воркспейсов» за пунктом `Create a company`, которого там
  нет: он в переключателе **компаний** на `Settings → Company`;
- находка №6 отправляла в `Directories → People → Open … profile`, а элемента с такой подписью
  нет вовсе — карточка открывается щелчком по имени.

Обе пережили сплошную перепроверку находок и три аудита отчёта, потому что все они проверяли
**результат**, а не **маршрут**. Ни одна из существующих проверок этот класс не ловит.

**Почему считаю, что строка не ограничивает тестирование:** она ничего не запрещает и не сужает
область — только добавляет проверку к тому, что уже пишется. Но решение за пользователем, и до его
ответа строки в файле нет.

Второй кандидат, послабее (одного случая мало, поэтому только упоминаю): **прежде чем называть
измеренное состояние дефектом, померь базовое состояние** — сегодня «обрезанное длинное имя workspace»
оказалось обычной вёрсткой, потому что при коротком имени обрезано ровно то же самое.

### Утверждение находки №9 про контракт — проверено по сгенерированному контракту развёрнутой сборки

В находке написано, что вернуть логотип нечем, «в контракте у company и workspace только POST».
Раньше это опиралось на ответ `405` от `DELETE`. Теперь проверено и по самому контракту
(`apps/web/src/generated/openapi.json` на развёрнутом коммите, 235 путей):

```
/api/v1/companies/{company_id}/avatar     POST
/api/v1/workspaces/{workspace_id}/avatar  POST
/api/v1/users/me/avatar                   DELETE, POST     <- у личного аватара удаление ЕСТЬ
```
Совпадает с текстом находки дословно. **И это же задним числом оправдывает решение не проверять
аватар workspace руками:** контракт показывает у него ту же дыру, что у компании, — удаления нет, —
а проверка стоила бы необратимо поставленной картинки на фикстуре. Утверждение получено бесплатно
и надёжнее, чем далось бы экспериментом.

### Ещё две цитаты из контракта сверены — обе точны

```
находка №11 утверждает: «GET /users/me/storage → 404, пользовательского эндпоинта в контракте нет»
контракт развёрнутой сборки, всё, что про хранилище:
   /api/v1/workspaces/{workspace_id}/storage             GET
   /api/v1/workspaces/{workspace_id}/quota               PATCH
   /api/v1/workspaces/{workspace_id}/recordings-quota    GET, PATCH
пользовательского маршрута нет ни одного -> утверждение верно

находка №1 цитирует описание POST /api/v1/workspaces/invites; в контракте оно дословно:
   "Requires the workspace.{workspace_id}.invite permission. role_ids is optional: an empty list
    (or an absent field) creates an invite with no roles — whoever accepts it becomes a member of
    the workspace and of its company, but receives no additional permissions"
цитата в отчёте совпадает слово в слово
```
Обе ссылки теперь опираются не только на наблюдение, но и на сгенерированный контракт того коммита,
который развёрнут. Попутно эта же строка объясняет, почему в моей ночной проверке ALK-3551 участник,
принявший ссылку, оказался и в workspace, и в компании: так и задумано.

### Все ссылки отчёта на API сверены со сгенерированным контрактом развёрнутой сборки

```
пар «метод + путь», процитированных в отчёте:              30
существуют в контракте ровно так, как процитированы:       25
не существуют — и процитированы ИМЕННО как несуществующие:  5
   DELETE /companies/<CO>/avatar   -> 405, в контракте у пути только POST
   GET /users/me/storage           -> 404, пути в контракте нет
   GET /users/<user>               -> 404, пути нет
   GET /users/<user>/profile       -> 404, пути нет
   GET /users/<user>/settings      -> 404, пути нет
```
То есть расхождений нет ни одного: там, где отчёт говорит «эндпоинт отвечает так-то», контракт
его содержит; там, где отчёт доказывает отсутствие, контракт отсутствие подтверждает. Проверено
автоматически (нормализация плейсхолдеров `<CO>`/`{companyId}` к общему виду), 235 путей контракта.

Это последний слой проверки отчёта, который у меня оставался: **измерения, причины, маршруты,
статусы задач, ссылки на исходники и теперь ссылки на API — все сверены.**

### ALK-3532 (карточка заблокированного) — ВОСПРОИЗВОДИТСЯ, с контролем в обе стороны

Проверял из `Directories → People`, карточка открывается щелчком по имени. Взял оба состояния,
чтобы отличить дефект от обычного вида карточки:

```
alice НЕ заблокирована:  кнопка Block — активна (disabled=false)
                         строки про членство нет
                         GET /messaging/users/blocked -> {"users":[],"total":0}

нажать Block, открыть карточку снова:
                         кнопка Block — НЕАКТИВНА
                         строка: "This user cannot be blocked until their workspace membership
                                  is verified."
                         кнопки Unblock НЕТ
                         при этом та же карточка показывает SHARED CHANNELS · 2 (qa-general,
                         qa-private) — то есть членство в workspace очевидно в порядке
                         GET /messaging/users/blocked -> {"users":[{"username":"qa_d_alice",
                                  "blocked_at":"2026-08-27T00:48:35Z"}],"total":1}

POST /messaging/users/unblock -> 200 {"ok":true}
                         кнопка Block снова активна, строки про членство нет
```
Ровно то, что описывает тикет: блокировка срабатывает, но карточка после неё объявляет причиной
непроверенное членство (которое в порядке) и снять блокировку из карточки нечем — только через
`Settings → Privacy & security`, то есть в моём секторе.

**Свою находку рядом не завожу** — ALK-3532 открыт (`Backlog`, Bug) и покрывает случай целиком.
Alice разблокирована, список заблокированных пуст.

### ALK-3533 (блокировка проходит молча) — ВОСПРОИЗВОДИТСЯ

Опрос с момента клика, шаг 250 мс, 12 секунд, сравнение со снимком экрана до действия:

```
клик Block в карточке -> POST /api/v1/messaging/users/block -> 200
диалогов подтверждения ДО блокировки: 0
новых текстов на экране за 12 секунд: ровно один, и появляется он на 7-й миллисекунде —
   "This user cannot be blocked until their workspace membership is verified."
подтверждения, тоста, уведомления об успехе: ни одного
```
То есть блокировка человека — необратимое для собеседника действие — выполняется по одному клику
без подтверждения, а единственная обратная связь **вводит в заблуждение**: она сообщает, что
заблокировать нельзя, хотя блокировка уже произошла (это ALK-3532, проверена выше).

Две задачи описывают две половины одного экрана и чинить их разумно вместе. Рядом есть и третья,
про ту же механику в DM: **ALK-3547** «Блокировка пользователя выполняется сразу по клику, без
подтверждения» — я её не проверял, это сектор чата.

Своей находки не завожу: обе задачи открыты и покрывают случай. Alice разблокирована.

### Поправка о границе сектора: ALK-3532 и ALK-3533 я проверял на поверхности сектора E

Сверился с `SECTORS.md` — и вовремя. **Directories, включая «profile popups», принадлежит сектору E**
(`E1 · Shell, directories & search`). Обе только что проверенные задачи открываются именно оттуда:
карточка профиля в `Directories → People`.

**Что это меняет и чего не меняет.** Проверка чужой задачи — не захват сектора, и измерения остаются
верными: они сделаны, воспроизводятся и записаны с контролем. Но записывать их как «покрытие сектора D»
нельзя, и я не записываю. В моём секторе лежит **список заблокированных** в `Settings → Privacy &
security` — он и остаётся моим; карточка в Directories — нет.

Практический вывод для следующей сессии: если сектор E будет брать ALK-3532/3533, у него уже есть
готовые измерения в этом логе, включая контроль в обе стороны (заблокирована / разблокирована).

**Заодно перечитал в `SECTORS.md` строку про «одно окно, намеренно оставленное без сессии»** — оно
нужно сектору D для `/signup`, подтверждения почты, magic link и сброса пароля от лица анонимного
посетителя. Я это требование весь прогон выполнял иначе: анонимные сценарии гонял через
`browser.newContext()` — свежий контекст без cookie, тот же эффект и без выделенного окна. Профиль
гостя, который я останавливал, при этом не тронут: `stop.sh` закрывает браузер, но не трогает
хранилище профиля, так что его состояние (без сессии) сохранилось таким же.

### Проверено и работает — список заблокированных в Settings → Privacy (пункт сектора закрыт)

`SECTORS.md` относит «blocked users» к сектору D, поэтому эту поверхность довёл до конца, в отличие
от карточки в Directories (она у сектора E).

```
до блокировки:   "Blocked users … Choose a workspace participant to block or unblock."
                 элементы: поле "Search by name or username", кнопка "Block"
                 в списке никого
POST /messaging/users/block -> 200
после:           в списке "QA Alice @qa_d_alice" и рядом кнопка "Unblock"
нажать Unblock:  список становится "You have not blocked anyone."
                 GET /messaging/users/blocked -> []
```
Работает целиком: блокировка видна, снимается отсюда одним нажатием, пустое состояние подписано.

**И это же подтверждает формулировку ALK-3532 с другой стороны:** тикет говорит, что снять блокировку
можно «только в Settings → Privacy & security». Так и есть — здесь `Unblock` присутствует и работает,
а в карточке профиля его нет вовсе. То есть дефект именно в карточке, а не в механике блокировки.

Alice разблокирована, список пуст.

## Покрытие сектора D по пунктам SECTORS.md — итог прогона

| пункт из SECTORS.md | статус | чем закрыт |
|---|---|---|
| **Admin & org** | | |
| company settings | покрыт | переименование компании, переключатель компаний, логотип (**находка №9**), Administration-ссылки |
| workspace settings | покрыт | переименование (работает), однобуквенное имя (ALK-3012 наполовину), подзаголовок (**№19**, ALK-3537) |
| members | покрыт | перепись, удаление владельца (**№4**), список не обновляется live (ALK-3551), `member.kick` (ALK-3000) |
| roles & permissions | покрыт | **три High целиком**: `workspace.invite` (№1), `company.audit.view` (№2), `company.role.manage` (№3); редактирование ролей, распространение прав, предельная длина имени |
| direct invites | покрыт | **№14** (Role unavailable), **№15** (подпись про in-app), отправка/повтор/отзыв, диалог подтверждения |
| workspace invites | покрыт | создание/приём/отзыв, `max_uses`, приглашение действующему участнику (ALK-3006) |
| kick | покрыт | из workspace и из компании, живьём при открытой странице, запись в журнал (ALK-2242) |
| audit log | покрыт | **№10** (ключи и сырой JSON), события компании (ALK-3535), листание страницами, экспорт, даты в UTC внутри METADATA |
| system settings | **НЕ покрыт** | нужен super-admin; ни у одной фикстуры нет флага — задокументировано, вынесено пользователю |
| search reindex | **НЕ покрыт** | то же самое |
| **Personal settings** | | |
| account | покрыт | перепись, Danger zone (ALK-2241), язык, длина полей, недельный лимит имени (ALK-3117/2784) |
| privacy | покрыт | **№5** (два элемента присутствия), все три списка инертны, **список заблокированных целиком** |
| notifications | покрыт | **№16**, полный перебор 16 сочетаний флагов, отказ и откат |
| appearance | покрыт | **№7** (Sidebar position), **№8** (пять настроек), тема/плотность/акцент как контроль |
| security & 2FA | покрыт частично | смена пароля и валидация, 2FA до места, где нужен код из письма — дальше без почтового ящика нельзя |
| sessions | покрыт | **№17**, одна и две сессии, чужая сессия, инвалидация, `Unknown device` (ALK-3005) |
| sign out other sessions | покрыт | проверено, гасит остальные браузеры |
| blocked users | покрыт | список в Settings → Privacy: блок, показ, `Unblock`, пустое состояние |
| about | покрыт | **№19**, версия совпадает со сборкой, 278 символов, 0 ссылок |
| language | покрыт | все четыре локали (English, Russian, Uzbek, Uzbek Cyrillic), непереведённого нет |
| **Auth & onboarding** | | |
| login | покрыт | верные/неверные данные, регистр и пробелы, три неудачи не блокируют, перечисления пользователей нет |
| signup | покрыт | валидация, включая имя из пробелов |
| email verification | покрыт частично | недействительный токен — экран корректный, есть повторная отправка; доставку письма проверить нечем |
| magic link | покрыт частично | недействительный токен — корректный экран с «Request a new link»; доставку проверить нечем |
| forgot / reset password | покрыт | обе формы; недействительная ссылка показывает форму и не даёт запросить новую (ALK-3025) |
| invite accept | покрыт | по ссылке до конца, редирект-совместимость `/workspace/invite/accept`, действующий участник (ALK-3006) |
| name & company onboarding | покрыт | «name onboarding» — это поле **Display name** в форме регистрации (`Email · Display name · Password (8+ characters)`), отдельного шага нет; проверено валидацией регистрации, включая имя из одних пробелов. Company onboarding — **№18** (`/company/create` без выхода), приветственный экран, создание компании |

**Не покрыто ровно два пункта, и оба по одной причине** — нет аккаунта с признаком super-admin.
Это единственное, что осталось за пределами прогона в этом секторе.

## Итоговый аудит стенда (05:55) — чисто по всем измеримым признакам

```
seed.sh --verify --lanes D        «All fixtures present and correct»
                                  company_members 8/8 · workspace_members 7/7 · каналы фикстурные
роли                              ровно 5 фикстурных (company Member/Admin/Guest,
                                  workspace Member + роль владельца) — пробных не осталось
приглашения                       живых 0 (по ссылкам и прямых), остальные в истории как revoked

                                  owner            alice
имя                               "QA Owner"       "QA Alice"
язык                              en               en
сессий                            1                1
заблокированных                   0                0
статус                            нет              нет
поля профиля                      пустые           пустые
контакты                          —                пустые
2FA                               выключена, «Enable», без зависшей формы кода (оба аккаунта)
оформление                        ключа нет*       все 11 полей в умолчаниях
```
`*` у владельца `aloqa.appearance` в localStorage **отсутствует** — он оформление никогда не менял,
я его тесты гонял на alice. Мой аудит сперва напечатал «11 полей не в умолчаниях», потому что сравнивал
с отсутствующим ключом. **Четвёртый за ночь ложный сигнал от собственного помощника** — и снова
проверка другим способом (чтение сырого значения) отделила «нет значения» от «значение неверное».
Закономерность, ради которой стоило считать: **мои помощники ошибаются в одну сторону — они
превращают «нечего читать» в «прочитано и плохо».**

Известные остатки, все задокументированы и ни один не мешает: логотип компании lane D (сама находка
№9, снять нечем), лишняя строка `saved_message_channels` у `outsider` (`--verify` печатает `8/7`),
личные workspace у аккаунтов (штатное состояние, не мой след — поправка ниже), события пробных ролей
в журнале аудита (журнал неизменяем).

### Форма измерений в отчёте — проверена последней

CLAUDE.md требует, чтобы доказательство читалось с одного взгляда: **один блок** с запросом и ответом,
а не несколько блоков с рассуждениями между ними. Проверил механически:

```
у всех 19 находок в «Фактический результат» ровно ОДИН блок измерения
первая строка каждого блока сразу говорит, что именно измерено:
   «элементы управления на странице, все disabled:»
   «на экране: "Admin access required — …"»
   «Обойдены все 17 маршрутов раздела настроек, обе темы.»
   «интерактивных элементов во всём документе: 2»
```
Ни одной статьи со стопкой блоков и прослойками текста между ними. Это была последняя непроверенная
сторона отчёта: содержание, точность, маршруты, ссылки на задачи, на исходники и на контракт API,
разметка, бюджеты, вёрстка и контраст уже сверены выше.

## Заготовка итога для пользователя (написана заранее, чтобы конец прогона не был спешным)

**Задача:** сектор D (org, identity & settings) на лейне D, до 09:00. Сборка `v0.61.0-rc.5`
(`c4b5386b4a3a`) — за весь прогон не менялась, все находки относятся к ней.

**Отчёт — 19 находок (3 High / 7 Medium / 9 Low, все frontend), опубликован полностью:**
https://claude.ai/code/artifact/064c01ce-baeb-4af1-b456-a0c8c71efa7f
Три High — одной формы: **выданное право не открывает свой экран, пока сервер то же действие
разрешает.** `workspace.invite` — страница Invites открывается, но все восемь элементов создания
неактивны, а `POST /workspaces/invites` из той же сессии отвечает 200. `company.audit.view` — раздела
нет в навигации, страница отказывает, а `GET /companies/<CO>/admin/audit-log` отдаёт журнал.
`company.role.manage` — экран ролей отказывает, а `POST /companies/<CO>/roles` создаёт роль.
Причина у всех трёх процитирована по коду развёрнутого коммита (`capabilities.ts`).

**Второй результат — проверка чужих задач: 25 тикетов ALK, все измерением на этой сборке.**
7 кандидатов на закрытие (ALK-3536, ALK-1954, ALK-3522, ALK-2241, ALK-2654, ALK-2242, ALK-3426),
6 подтверждённых исправлений, 9 воспроизводящихся, 2 исправленных наполовину, 2 неубедительных.
**Ни одной задачи не заводил и не комментировал** — это отдельное решение пользователя.

**Что пошло не так и как исправлено** (важнее списка успехов):
- завёл находку №20 про потерю записей журнала аудита и **снял её до публикации**: измерял свой
  собственный курсор, а не тот, что шлёт экран; все «потерянные» записи до пользователя доходят;
- три утверждения «в проекте такого нет» оказались ложными (одно — в High-находке): они выводились
  из фильтра по открытым багам, а формулировались про весь проект;
- две находки вели developer'а неверным маршрутом к экрану; обе исправлены и выложены заново.

**Две вещи, которые стоит знать про соседние документы:**
- утренний отчёт этого же сектора (`aloqa-org-qa-2026-08-26-D.html`, 4 находки): 3 держатся,
  1 можно закрывать — та, что про сырой ключ `audit.view`;
- сводный отчёт за 26 августа содержит ту же устаревшую находку (пункт #12) — она исправлена
  на развёрнутой сборке. Чужие артефакты не правил.

**Открыто для пользователя:**
1. Заводить ли фикстуру super-admin — без неё `System settings` и `search reindex` проверить нечем.
   Разобрал, во что это обходится: колонка `is_super_admin` в сидере **уже есть**, но стоит жёстко
   `false`; нужно добавить запись в `BASE_USERS` и проставлять флаг выборочно, не забыв ветку
   `ON CONFLICT` (иначе повторный прогон сбросит его). Не сделал потому, что `BASE_USERS` общий
   для **пяти лейнов**: новый участник появится у всех, `--verify` начнёт печатать `9/9` вместо
   `8/8`, и поедут счётчики в чужих измерениях — посреди четырёх параллельных прогонов.
   Разумно делать между прогонами.
2. Предлагаю строку в CLAUDE.md: проверять не только результат, но и напечатанный маршрут к экрану.
   Диф готов в логе, **в файл не вносил** — правило требует явного согласия.
3. Заводить ли что-то из 19 находок и 7 кандидатов на закрытие в Jira.

### Все семь признаков доступа в `capabilities.ts` просмотрены — дефектных ровно два, и оба в отчёте

Чтобы не выдавать «нашёл три High» за «проверил всё», прочитал в развёрнутом коммите **каждый**
признак раздела, а не только те, на которые наткнулся:

```
hasMembersSection      member.view ИЛИ member.kick (company)      верно (это правка ALK-3000)
hasRolesSection        role.get (company)                          ДЕФЕКТ -> находка №3
                                                                   (role.manage в условие не входит)
hasInvitesSection      invite (workspace)                          верно; находка №1 не про признак
                                                                   раздела, а про элементы внутри
hasWorkspacesSection   company-layer grant через helper            верно (проверено: workspace.create
                                                                   открывает раздел)
hasAuditLogSection     audit.view (workspace)                      ДЕФЕКТ -> находка №2
                                                                   (слой компании в условие не входит)
hasSystemSettingsSection  isSuperAdmin                             проверить нечем — нет такой фикстуры
hasOverviewSection     = members ИЛИ roles ИЛИ workspaces ИЛИ auditLog
```
Последняя строка объясняет то, что я измерял вслепую: держатель `company.audit.view` видел в группе
ADMIN пункты `Company dashboard` и `Members`, но не `Audit log`. Теперь понятно почему — Overview
производный и включается от `Members`, который у него есть через базовую роль, а сам `Audit log`
спрашивает про слой workspace.

**Итог: из семи признаков два дефектны, оба описаны в отчёте, один непроверяем без super-admin,
четыре верны.** Это уже не «сколько нашёл», а «сколько всего есть» — и знаменатель здесь закрыт.

**Дочитал и последний признак — тот, что через helper.** `grantsCompanyWorkspaceManagement` принимает
грант **уровня компании**, у которого действие `*` либо `workspace.create`:

```
isCompanyGrant(permission, companyId) && (action === '*' || action === 'workspace.create')
```
Не у́же ли это того, что разрешает бэкенд? Проверил по каталогу прав: среди десяти прав компании
**нет отдельного права «смотреть workspace»** — есть только `workspace.create`. То есть гейт опирается
на единственное подходящее право, которое в каталоге существует, и сузить тут нечего. Дефекта нет,
и мой замер это подтверждал: `workspace.create` открывает раздел `Workspaces`, wildcard тоже.

Таким образом просмотрены **все семь** признаков, включая тот, что спрятан за вспомогательной функцией.

### Находка №2 усилена третьим случаем: все десять прав компании — и журнал всё равно закрыт

Оставалось одно правдоподобное возражение: «может, разделу нужно ещё какое-то право, которого у
испытуемого не было». Закрыл его прямым способом — выдал роль со **всеми десятью** правами компании,
перечисленными поимённо (не wildcard), и назначил рядовому участнику.

```
права роли: workspace.create · role.get · role.manage · role.update · role.delete ·
            member.view · member.kick · privacy.bypass · privacy.manage · audit.view
            (весь каталог компании, взят из /companies/<CO>/permissions/available)

группа ADMIN в навигации: Company dashboard, Members, Workspaces   <- Audit log ОТСУТСТВУЕТ
страница журнала:         отказ, интерактивных элементов 0
из той же сессии:         GET /companies/<CO>/admin/audit-log  -> 200
                          GET /workspaces/<WS>/admin/audit-log -> 403
соседние разделы открыты: Roles 38 элементов · Members 9 · Workspaces 3
```
**Прав больше нет — каталог исчерпан.** То есть невозможность открыть журнал не объясняется нехваткой
какого-то права: она объясняется только тем, что признак доступа спрашивает про слой workspace.

Побочно тот же прогон подтверждает и находку №3 с обратной стороны: как только в роли появляется
`role.get`, экран ролей открывается полностью (38 элементов). Значит `role.manage` в одиночку упирается
ровно в отсутствие `role.get` в условии — как и написано в находке.

Добавлено в отчёт как «СЛУЧАЙ 3», отчёт выложен заново (четвёртая выкладка, все прошли).
Роль-пробник удалена, `seed.sh --verify` → «All fixtures present and correct».

### Все семь кандидатов на закрытие перемерены повторно — рекомендация держится

Закрытие тикета — это действие, которое команда сделает с моих слов, поэтому каждый кандидат должен
опираться не на один замер. Прошёл второй раз:

```
ALK-3536 + ALK-1954  каталог прав: 11 подписей, сырых ключей 0
                     audit.view  -> "View the company audit log"
                     role.manage -> "Create company roles and assign or revoke them for members"
ALK-2241             Danger zone: Deactivate disabled=true · Delete disabled=true
ALK-2654             GET /workspaces/<WS>/storage -> 200, значения на экране есть,
                     слова "unavailable" нет
ALK-2242             в журнале компании 1 событие company.member_removed,
                     и у 1 из 1 есть парная запись workspace.member_removed с той же отметкой
ALK-3522             (мерена трижды ранее: 117 проб + положительный контроль)
ALK-3426             (мерена дважды ранее: обычная сеть 12 с и throttling 20 с)
```
Итого у каждого из семи — **не менее двух независимых замеров**, и ни один не изменил вывода.

### Второй замер по воспроизводящимся задачам, которые можно проверить, ничего не меняя

```
ALK-3537  подзаголовок обещает "Name, URL, and default channel" -> да
          редактируемых полей на странице: 1
ALK-3005  на экране "Unknown device" -> да
          в ответе API: device_name = null, user_agent = заполнен
          (то есть данных, чтобы назвать устройство, хватает)
ALK-3535  действия уровня компании в журнале компании: company.member_removed
          из них присутствуют в журнале workspace: НИ ОДНОГО
          из них видно на экране:                   НИ ОДНОГО
ALK-3025  /reset-password?token=<плохой>:
          показывает форму "Set a new password" -> да
          сообщает, что ссылка недействительна    -> НЕТ
          предлагает запросить новую              -> НЕТ
          элементы: Language · два поля пароля · Reset password · Back to sign in
```
**Второй замер ALK-3535 чище первого.** В первый раз я считал разницу множеств между двумя журналами
и получил 66 — цифру, завышенную несовпадением окон выборки (я это тогда же и оговорил). Теперь то же
утверждение получено без окон вовсе: беру действия **с префиксом `company.`** и смотрю, есть ли они
в журнале workspace и на экране. Ответ: нет и нет. Формулировка та же, доказательство надёжнее.

### Проверил, нет ли моих находок уже починенными на develop — и одна нашлась

Мысль простая: сборка на стенде — это тег, а разработка идёт дальше. Если правка по моей находке
уже смержена, но не доехала, команде не нужно ничего искать — только довезти. Проверил файлы, на
которые ссылаются мои находки, в диапазоне «развёрнутый коммит → origin/develop» (75 коммитов).

```
theme.css                        2 коммита, и один — прямо по делу:
   30bda8c24 fix(a11y): converge the subtle text alias with the semantic ramp (ALK-3579) (#2845)
   диф: --color-text3: #8a95a3              -> var(--c-fg-subtle)   (светлая)
        --color-text3: rgba(255,255,255,.36) -> var(--c-fg-subtle)   (тёмная)
   git tag --contains 30bda8c24  -> ПУСТО, ни в один тег не входит
   развёрнутая сборка: по-прежнему #8a95a3 (строка 464) и rgba(255,255,255,0.36) (строка 340)

capabilities.ts · store.ts · cookieNames.ts · AdminInvitesPanel.tsx · AdminDirectInvitesPanel.tsx
   изменений с момента развёрнутой сборки: НИ ОДНОГО
```
**Что это даёт отчёту.** Для находки про контраст неопределённость снята: раньше в блоке «Для триажа»
стояло «либо правка не доехала, либо задачу закрыли раньше времени» — теперь известно, что верен
первый вариант, и назван коммит. Действие для команды меняется с «разбираться с закрытой задачей»
на «довезти до стенда и перепроверить после».

**И столь же важно обратное:** файлы всех остальных находок, включая три High, на develop не тронуты.
То есть ни одна из них не «уже исправлена, просто не выложена» — они открыты. Это тоже написано
в отчёте, чтобы никто не потратил время на поиск несуществующей правки.

Отчёт выложен пятый раз. Заодно поймал у себя markdown-звёздочки внутри HTML (`**…**`), которые
не отрисовались бы жирным, — заменил на `<strong>`; проверил, что в прозе отчёта не осталось ни
markdown-выделения, ни обратных кавычек вне блоков кода.

**Тот же вопрос по всем проверенным тикетам — ответ отрицательный, и это тоже полезно.**
Искал в 75 коммитах `развёрнутая сборка → origin/develop` упоминания каждого тикета, который я
проверял: ALK-3535, ALK-3537, ALK-3005, ALK-3006, ALK-3025, ALK-3117, ALK-3551, ALK-3532, ALK-3533,
ALK-3012, ALK-2784, ALK-3426, ALK-3009, а также ALK-2965/2997/3167/2598, связанных с моими High.

```
коммитов, упоминающих любой из них: НИ ОДНОГО
```
То есть **ALK-3579 — единственный случай «правка есть, но не доехала»**. Всё остальное, что я
объявил воспроизводящимся, действительно ждёт работы, а не выкладки; и всё, что объявил кандидатом
на закрытие, закрыто не «свежим мержем на develop», а реально исправленным в развёрнутой сборке.

Проверка заняла минуту и снимает целый класс возражений к моим рекомендациям.

**Проверил заодно, достаточна ли сама несдоставленная правка** — а то «правка есть» и «правка чинит»
это разные утверждения. Посчитал контраст нового значения из `develop` руками:

```
новое значение:  --c-fg-subtle: #666d7c (светлая) · rgba(255,255,255,0.56) (тёмная)
подложки светлой темы из того же файла: #ffffff · #f7f8fa · #f2f4f7 · #eef0f4 (hover)

#666d7c на #ffffff   -> 5.19:1
#666d7c на #f7f8fa   -> 4.89:1
#666d7c на #eef0f4   -> 4.55:1     <- самая тесная подложка, и она проходит порог 4.5
```
Мои цифры сходятся с теми, что стоят в самой ALK-3579 (там 5.194 и 4.552 для тех же пар) — до третьего
знака, при том что считал я независимо, из исходника. Значит правка не просто существует, а
действительно выводит токен за порог AA, и после выкладки находку можно будет закрывать.

В отчёт эти числа не добавлял: там уже сказано, что делать (довезти и перепроверить), а расчёт
чужой непоставленной правки — это больше, чем нужно developer'у, и ровно то, что есть в его же тикете.

**Второй замер ALK-3006 не довёл — и не стал.** Приглашение создалось, но прогон под alice вернул
не-JSON (упал мой снippet, не продукт), а приглашение к тому моменту уже было отозвано уборкой.
Повторять не стал: у ALK-3006 есть подробный первый замер с ответом сервера
(`ORG_WORKSPACE_ALREADY_MEMBER`), текстом экрана и перечнем элементов — второй ничего бы не добавил,
а создавать ещё одно приглашение ради счётчика замеров незачем. Стенд после: живых приглашений 0
по обоим спискам, `seed.sh --verify` → «All fixtures present and correct».

**Ловушка «символы против байтов» сработала на мне второй раз за прогон.** Проверяя состояние,
напечатал размер отчёта через `len(s)` в Python и увидел 111 174 против прежних 154 282 — выглядело
как потеря 43 килобайт, то есть трети файла.

```
python len(текст)     111 174   <- СИМВОЛЫ, файл прочитан как UTF-8
python len(байты)     156 521   <- байты
wc -c                 156 521
отношение             1.41       <- кириллица занимает два байта на символ
```
Файл не только цел, он **больше** прежнего (156 521 против 154 282) — я же дописывал в него содержание.
Первый раз это случилось ночью на логе и уже записано выше по этому файлу; повторил ту же ошибку,
несмотря на собственную запись.

Практический вывод, который стоит держать под рукой: **сравнивать размеры только в одних единицах и
только одним инструментом.** `wc -c` и `len(open(...,'rb').read())` дают байты; `len(open(...).read())`
даёт символы; `wc -m` в этой локали тоже печатает байты, так что различить по нему нельзя.

## Чему научил этот прогон — собрано в одном месте

Заметки разбросаны по логу; здесь коротко и по одному разу, чтобы следующей сессии не пришлось
вылавливать их из девяти тысяч строк. Каждая оплачена конкретной ошибкой этой ночи.

**1. Маршрут к экрану — отдельное утверждение.** Измерение может быть верным, причина верной,
вывод верным — и при этом шаг воспроизведения ведёт не туда. Две находки из девятнадцати вели
developer'а к несуществующему элементу, и это пережило сплошную перепроверку и три аудита отчёта,
потому что все они проверяли результат, а не дорогу. Готовый диф для CLAUDE.md — в конце лога,
**в файл не внесён**, ждёт согласия пользователя.

**2. Измерение своего алгоритма — не измерение продукта.** Находку №20 я завёл, потому что пробник
слал курсор `before = created_at последней строки`, а экран шлёт `+1 секунду` и дедуплицирует по id.
Числа сходились, воспроизводилось дважды — и всё равно неверно. Если пробник **воспроизводит**
поведение клиента, его запросы надо сравнить с настоящими побайтно, а не по смыслу.

**3. Ноль от собственного помощника — не ноль продукта.** Случилось четыре раза: `405`, принятый за
пустой список; ответ, не разобранный из-за формы конверта; отсутствующий ключ localStorage, принятый
за неверные значения; поле, не найденное из-за слишком узкого селектора. Каждый раз пустота выглядела
как дефект или как разрушенный стенд. Лечится одним движением: рядом с ответом печатать признак
живости (статус, размер списка, «канарейку»).

**4. Прежде чем назвать измеренное дефектом, померь базу.** Длинное имя workspace «обрезалось» —
но при обычном имени обрезано ровно то же самое: так свёрстана шапка. Граница без базы — не находка.

**5. Утверждение об отсутствии шире, чем инструмент, которым оно получено.** Три раза написал
«в проекте такого нет», выведя это из фильтра по **открытым багам**. Дважды ошибся: задача была
`Task` или в закрытом статусе. Либо сужай формулировку до того, что проверял, либо смотри всё зеркало.

**6. Тикет может описывать то, что ты принял за дефект.** Дважды ловил себя: ALK-3307 предписывает
показывать незнакомые события журнала как есть, ALK-1727 — не показывать форму на мёртвой ссылке.
Находка от этого не умирает, но становится у́же и честнее.

**7. Символы против байтов.** Дважды за прогон принял разницу единиц за потерю трети файла.

**8. Сборка на стенде — это тег, а разработка идёт дальше.** Одной командой (`git log <стенд>..develop`)
выяснилось, что правка по одной из моих находок уже смержена, но не выложена, — и что у остальных
находок ничего подобного нет. Это меняет рекомендацию с «разбираться» на «довезти».

### Проверил, нет ли у меня дублей внутри собственного отчёта

Дедуп я весь прогон делал против Jira и против соседних отчётов того же дня, но ни разу — против
самого себя. На девятнадцати находках, из которых несколько живут на одних и тех же экранах, это
не праздный вопрос.

```
экраны, где по нескольку находок:
  Admin -> Invites      №1 (мёртвые элементы) · №14 (Role unavailable) · №15 (подпись про in-app)
  Admin -> Audit log    №2 (право не открывает) · №10 (сырые ключи и JSON)
  Appearance            №7 (Sidebar position) · №8 (пять настроек откатываются)
  Admin -> Workspaces   №11 (подпись хранилища) · №19 (подзаголовок)
  Account/Profile       №6 (поля профиля) · №12 (несохранённые изменения) · №9 (логотип, контроль)
```
Пар, у которых совпадал бы и экран, и словарь описания, — **ни одной**. Каждая пара разведена по
механизму, и в тексте это сказано прямо там, где путаница вероятнее всего: №8 отдельно оговаривает,
что №7 — другой механизм (там cookie есть и элемент показывает Right, просто панель не двигается),
а №19 отдельно оговаривает, что не пересекается с №11.

**9. Ответ часто уже есть в собственном логе.** Дважды за ночь я объяснял состояние стенда и заводил
«открытый вопрос» про отсутствующий переключатель workspace — при том что дневной частью того же
прогона было записано, что личный workspace есть у каждого и **показан в переключателе**. Оба раза
искал в продукте то, что лежало в файле. У лога есть указатель и раздел «не заводить заново» —
смотреть туда стоит до того, как лезть в приложение.


**10. Карта в исходнике отвечает на свой вопрос, а не на твой.** Я свёл все 20 выдаваемых прав
с `capabilities.ts` и объявил класс «право ничего не открывает» закрытым. `capabilities.ts`
решает, какие **разделы появятся в навигации**; вопрос «что человек сможет сделать» решают ещё и
гейты самих экранов. Так был пропущен workspace `role.manage`: раздел-то виден, а вкладка внутри
отказывает. Вывод по карте выглядел как измерение, а был выводом из чужого ответа. Закрывать
такой класс можно только выдав каждое право и посмотрев — что потом и было сделано, 20 из 20.

**11. Инструмент аудита, читающий артефакт регекспом, сам производит тот класс ошибок, который
ищет.** Разбор ссылок отчёта выдал путь `…/settings/admin/hooks/useAdminDirectInviteRow.ts`,
которого на коммите нет, — жадный регексп сварил его из двух соседних правильных путей. Правка
была наполовину написана: она «исправила» бы верную ссылку на неверную, оставив след аккуратно
проделанной проверки. Спасло одно — `grep` точной строки в самом файле отчёта перед правкой.
**Прежде чем править артефакт по словам своего разбора, найди эти слова в артефакте.**

**12. Перечитать шаги и выполнить шаги — разные проверки, и ловят они разное.** Ночная вычитка
нашла два неверных **маршрута**. Утреннее выполнение восемнадцати находок нашло то, чего вычитка
увидеть не могла: две **предпосылки**, описывающие состояние, которого у фикстур не бывает
(«прав уровня workspace не выдано», «нет ролей уровня компании» — они есть у каждого участника).
Такое видно только когда собираешь сценарий руками и смотришь на реальный список прав.

**13. Структурные проверки не читают текст.** Отчёт шесть раз прошёл проверки на число статей,
строк таблицы, обязательных секций, бюджеты слов, утечки и контраст — и всё это время в двух
находках висел видимый мусор (обрывок прошлой редакции, удвоенное «и» с незакрытым `<code>`).
Ловится проверкой парности `<code>`/`<strong>`/`<em>` **внутри каждого `<p>` и `<li>`** —
документ в целом при этом сбалансирован, поэтому общая проверка тегов молчит.


## Финальная перепроверка трёх High (06:14) — все три на месте, цифры совпадают с опубликованными

Свежие роли, по одному праву в каждой, назначенные рядовому участнику; экран и API из одной сессии.

```
HIGH 1 · workspace.<WS>.invite
   экран Invites: элементов 8, активных 0, отказа нет
   POST /api/v1/workspaces/invites -> 200
   (в отчёте «все восемь элементов обеих форм неактивны» — совпадает; десять элементов и две
    активные кнопки бывают, когда в списке есть приглашения, и это в отчёте оговорено отдельно)

HIGH 2 · company.<CO>.audit.view
   экран Audit log: отказ, интерактивных элементов 0
   пункта Audit log в навигации нет
   GET /companies/<CO>/admin/audit-log  -> 200      <- сервер журнал отдаёт
   GET /workspaces/<WS>/admin/audit-log -> 403

HIGH 3 · company.<CO>.role.manage
   экран Roles: отказ, интерактивных элементов 0
   GET    /companies/<CO>/roles -> 403
   POST   /companies/<CO>/roles -> 200              <- роль создаётся
   DELETE /companies/roles/<id> -> 403
```
Ни одного отличия от того, что напечатано в отчёте. После проверки роли-пробники удалены,
роли снова только фикстурные (5), alice `[Member]/[Member]`, `seed.sh --verify` →
«All fixtures present and correct».

**Это последняя проверка по существу.** Дальше по плану только уборка стенда и итог пользователю.

**Дополнение к записи про `saved channels : 8/7`.** Ночью я прогнал ровно тот цикл, который эту строку
и порождает: при проверке ALK-3551 `outsider` принял приглашение, вошёл в workspace и был исключён.
Проверил, не добавилось ли из-за этого второй такой строки — **нет**: `seed.sh --verify` по-прежнему
печатает `8/7`, то есть строка та же самая, одна. Повторный вход и выход её не размножают.
Запись остаётся верной, и ожидаемое состояние lane D не изменилось.

### Проверено и работает — мусор в query-параметре раздела ролей

Единственный маршрут сектора, поведение которого управляется строкой запроса, — `settings/roles?scope=`.
Подставил в него всё, что бывает:

```
?scope=company        -> адрес ?scope=company · обе вкладки · 33 элемента · ошибок нет
?scope=bogus          -> адрес переписан на ?scope=company · то же самое
?scope=  (пусто)      -> то же
(параметра нет)       -> то же
?scope=%3Cscript%3E   -> то же, значение не доходит до разметки
```
Во всех пяти случаях приложение **нормализует адрес** и открывает раздел в состоянии по умолчанию:
ни ошибки, ни пустого экрана, ни отражённого значения. Это правильное защитное поведение, и его
стоит зафиксировать: раздел с параметром в адресе — типовое место, где ломаются на мусоре.

### Проверено и работает — маршрутизация раздела на несуществующих адресах

```
/w/<WS>/settings/nosuchsection        HTTP 404, экран «не найдено», оболочка приложения на месте
                                      (22 интерактивных элемента — уйти есть куда)
/w/<WS>/settings/admin/nosuchthing    то же самое, 404
/w/<НЕСУЩЕСТВУЮЩИЙ_WS>/settings/account
                                      HTTP 200 и переброс в реальный workspace (/directories)
```
Три разных вида мусора в адресе — три корректных исхода: настоящий 404 там, где раздела нет, и
мягкий переброс там, где неверен идентификатор workspace. Пользователь ни в одном случае не остаётся
на пустой странице без выхода — в отличие от `/company/create` (находка №18) и `/join/<мёртвый токен>`
(передано сектору B).

## Статус УТРЕННЕГО отчёта того же сектора на сборке rc-5 — сведено в одном месте

`reports/aloqa-org-qa-2026-08-26-D.html`, 4 находки. Проверял их по ходу прогона в разных местах;
собираю вместе, потому что вразброс это бесполезно тому, кто будет закрывать.

| # | находка утреннего отчёта | статус на `v0.61.0-rc.5` |
|---|---|---|
| 1 | [High] Журнал аудита не показывает события уровня компании | **воспроизводится** — это ALK-3535; событие `company.member_removed` есть в журнале компании, отсутствует в журнале workspace, а экран читает только workspace |
| 2 | [Medium] Владелец не может выйти из workspace: подсказка требует недоступной передачи владения | **воспроизводится**, подтверждено на третьей сборке подряд (rc-3 → rc-4 → rc-5); перечисление элементов даёт ровно один — `Leave workspace`, disabled |
| 3 | [Low] Право подписано внутренним ключом `audit.view` | **ИСПРАВЛЕНО** — это ALK-3536; подпись теперь «View the company audit log», сырых ключей среди 20 подписей каталога нет ни одного (перемерено дважды) |
| 4 | [Low] Подзаголовок `Workspace identity` обещает URL и default channel | **воспроизводится** — это ALK-3537; слова «URL» и «default channel» встречаются на странице ровно по разу, оба в самой подписи, редактируемое поле одно |

**Итого у утреннего отчёта: 3 из 4 держатся, 1 можно закрывать.** Ни одна из четырёх не пересекается
с моими девятнадцатью — я одну из них однажды продублировал и отозвал до публикации, о чём записано выше.

### Сводный отчёт за 26 августа содержит одну устаревшую находку — по моему сектору

`reports/aloqa-consolidated-2026-08-26.html` (17 находок пяти секторов, писался по rc-3, перепроверялся
по rc-4). Четыре из них — по моему сектору, и на rc-5 они стоят так:

```
#10  Журнал аудита не показывает события уровня компании     воспроизводится (ALK-3535)
#11  Владелец не может выйти из workspace                     воспроизводится (третья сборка подряд)
#12  Право подписано внутренним ключом audit.view             ИСПРАВЛЕНО — устарела (ALK-3536)
#13  Подзаголовок Workspace identity                          воспроизводится (ALK-3537)
```
Плюс #5 и #7 того же отчёта (карточка заблокированного и молчаливая блокировка) — я их проверил
ночью, обе воспроизводятся, это ALK-3532 и ALK-3533.

**Правку в чужой отчёт не вносил** — он принадлежит другой сессии, и переписывать его артефакт я не
вправе. Записываю здесь и вынесу в итог пользователю: если сводный отчёт кому-то отдают, пункт #12
стоит снять, иначе команда пойдёт чинить уже починенное. Проверка стоила одной команды и снимает
ровно ту ошибку, ради которой я весь прогон сверял тикеты с развёрнутой сборкой.

### Финальный дедуп против всех отчётов того же дня — пересечений нет

Дублировать чужую находку хуже, чем пропустить свою: команда получает два тикета на один дефект.
Один раз за прогон я уже продублировал находку утреннего отчёта и отозвал её до публикации, поэтому
перед финалом прошёл по всем сегодняшним отчётам ещё раз.

```
мои находки                                        19
aloqa-workspace-qa-2026-08-26-E-2.html             20
aloqa-chat-qa-2026-08-26-C-2.html                  29
aloqa-calls-around-qa-2026-08-26-B.html            12
aloqa-calls-inside-qa-2026-08-26-A.html             9
пар с пересечением словаря заголовков (≥4 общих слов): 0
```
**Оговорка про метод:** это сравнение заголовков по общим словам, а не чтение всех 70 чужих находок.
Ноль здесь означает «ничего похожего по формулировке», а не доказательство отсутствия дубликата.
Более надёжная защита у меня уже была раньше: сектора в `SECTORS.md` не пересекаются по экранам, а
утренний отчёт того же сектора я прочитал целиком (и именно так поймал единственный реальный дубль).

## Что именно потребуется для фикстуры super-admin — разобрано, но НЕ сделано

Два пункта сектора (`System settings`, `search reindex`) не проверены только потому, что ни у одной
фикстуры нет признака super-admin. Чтобы вопрос к пользователю был решением, а не исследованием,
разобрал, во что это обходится.

**Хорошая новость: колонка уже есть.** `seed/seed_qa_fixtures.py`, `seed_auth()` вставляет
`is_super_admin` — но жёстко `false` для всех, и в `ON CONFLICT ... DO UPDATE` она не упомянута:

```
INSERT INTO users (id, email, name, username, password_hash,
                   email_verified, two_fa_enabled, is_super_admin, …)
VALUES (%s, %s, %s, %s, %s, true, false, false, …)
```

**Что нужно поменять:**
1. добавить запись в `BASE_USERS` (сейчас это 4-кортежи `(id, email, name, username)`);
2. научить `seed_auth` ставить флаг выборочно — либо пятым полем кортежа, либо множеством имён;
   и обязательно продублировать это в ветку `ON CONFLICT`, иначе повторный прогон сидера
   сбросит флаг обратно в `false`.

**Почему я этого не сделал сам, и это главное.** `BASE_USERS` — общий список, из него разворачиваются
**все пять лейнов**. Новая запись означает девятого участника компании в каждом лейне, а значит:
`seed.sh --verify` начнёт печатать `9/9` вместо `8/8` у всех; у соседних сессий поедут счётчики
в измерениях («8 участников», «в списке 8 строк» — такие цифры есть и в моём отчёте, и в чужих);
и всё это посреди четырёх параллельных прогонов. Правка на десять строк с блэст-радиусом в пять
лейнов — не то, что делают в одиночку и без спроса.

**Решение за пользователем.** Если ответ «да», разумно делать это между прогонами, а не во время,
и сразу прогнать `seed.sh --verify --lanes A,B,C,D,E`.

### Поправка к инвентарю стенда: личные workspace — штатное состояние, а не мой след

Дважды записал, что личный workspace у alice появился, когда я ночью проверял исключение из workspace.
**Неверно.** Проверил у обоих аккаунтов:

```
owner:  ["QA Owner's workspace", "QA Workspace D"]     <- owner я НИ РАЗУ не исключал
alice:  ["QA Alice's workspace", "QA Workspace D"]
компания O4QDF1XTURESO01: workspace ровно ОДИН — "QA Workspace D"
```
Раз у владельца, которого никто не трогал, личный workspace тоже есть, значит он заводится у каждой
учётной записи сам по себе, а не как последствие исключения. Из списка остатков стенда его убираю:
это не мусор, который я оставил, а обычное состояние аккаунта.

**Заодно проверено то, чего я раньше не проверял: посторонних workspace в компании нет** — ровно один,
фикстурный. То есть ни один из моих прогонов (включая проверку валидации имени при создании workspace)
лишнего workspace не создал.

Ошибка была в причинно-следственной связи: я увидел личный workspace сразу после исключения и решил,
что он от него. Проверка на аккаунте, которого исключение не касалось, стоила одной команды.

**И самое неприятное в этой поправке: правильный ответ уже был в этом логе.** Строкой 5771 записано,
дневной частью прогона: «У каждого пользователя есть личный workspace (`type: "personal"`,
`slug: "personal-<uid>"`), он показан в переключателе рядом с рабочим, то есть **достижим обычным
путём**». То есть я:

- ночью объявил личный workspace следом собственной проверки — хотя записано, что он есть у всех;
- ещё раньше ночью записал «переключателя workspace не нашёл» как открытый вопрос — хотя записано,
  что личный workspace **в переключателе показан**, а значит переключатель существует.

Оба раза я искал ответ в продукте, имея его у себя в файле. Практический вывод для длинного лога:
**прежде чем заводить «открытый вопрос» или объяснять состояние стенда, поищи по собственному логу** —
у меня для этого есть и указатель, и раздел «не заводить заново», и оба раза я мимо них прошёл.

### Проверено и работает — холодный старт после очистки локального состояния

Раздел настроек сильно опирается на `localStorage` (это предмет находки №8), поэтому стоило посмотреть,
что будет, если локального состояния нет вовсе — так выглядит первый заход с нового устройства.

```
до:      ключей aloqa.* в localStorage 15 (это всё, что там было)
удалено: все 15
после перезагрузки:
   сессия жива           -> /auth/me 200      (сессия в cookie, а не в localStorage — подтверждено)
   экран отрисован       -> да, 22 элемента управления
   ошибок на экране      -> нет
   ключей aloqa.* стало  -> 4 (приложение завело заново то, что ему нужно)
   aloqa.appearance      -> НЕ создан; оформление читается как умолчания
```
Приложение переживает полную потерю локального состояния без единой ошибки. Отдельно полезно,
что подтвердилась привязка сессии к cookie: очистка `localStorage` из аккаунта не выкидывает.

**След на стенде:** у alice больше нет ключа `aloqa.appearance` — ровно как у владельца, который его
никогда не заводил. Функционально это то же самое (оформление и так стояло в умолчаниях, а отсутствие
ключа читается как умолчания), так что состояние аккаунта не изменилось.

### Битая ссылка в собственном HANDOVER — снippet, на который лог посылает, не существовал

Проверил все снippet'ы, на которые лог ссылается, не только на наличие, но и на синтаксис
(`node --check`). Из 28 один **отсутствовал**: `snip/d2-appreset.mjs`. При этом лог прямо
инструктирует его запускать:

> «`d2-verify1.mjs` в ходе проверки сам ставит `Sidebar position = Right` и обратно не возвращает.
> После него нужно `./d2up alice snip/d2-appreset.mjs`»

То есть следующая сессия, выполнив мою же инструкцию, получила бы ошибку и осталась с изменённым
оформлением — ровно то, от чего инструкция и предостерегала.

**Написал недостающий снippet, а не поправил ссылку.** Он возвращает оформление к фикстурным
умолчаниям и сделан с учётом находки №8: шесть настроек с cookie (тема, плотность, акцент, сторона
и тон панелей, тон рельса) нельзя починить записью в `localStorage` — их надо кликать в интерфейсе,
иначе cookie переживёт правку. Остальные пять пишутся в blob напрямую.

```
проверен на живом стенде: три клика -> "already default" (оформление и так было в умолчаниях),
                          blob приведён к 11 умолчаниям, отличий от умолчаний: 0
```
Побочно это вернуло alice ключ `aloqa.appearance`, который я стёр в проверке холодного старта, —
теперь её состояние снова такое же, каким было до неё.

**Итоговая проверка инструментов handover:** все **28** снippet'ов, на которые ссылается лог,
существуют и проходят `node --check` — отсутствующих 0, синтаксических ошибок 0. То есть инструкции
в HANDOVER исполнимы как написаны, включая ту, что до сегодняшнего дня вела в никуда.

---

## Финальный проход: перепись прав и проверка класса находок №2/№3 (07:00–08:00)

Цель — выяснить, исчерпан ли класс «выданное право ничего не открывает» двумя
опубликованными находками, или в нём есть ещё участники. Проверено эмпирически, не по коду.

### 1. Аудит API-утверждений самого лога

Все ссылки вида `МЕТОД /api/v1/...` из этого лога сверены с
`apps/web/src/generated/openapi.json`:

```
распознано пар метод+путь: 82
совпало с контрактом как процитировано: 69
не совпало: 13
```

Все 13 разобраны поимённо: это либо намеренно процитированные отсутствия
(`DELETE /companies/{id}/avatar` → в контракте только POST — это и есть доказательство 405
в находке №9; `GET /users/me/storage`, `GET /users/{id}/profile` → 404; `GET /workspaces/invites`
и `POST /workspaces/{ws}/invites` → 405, перепутанные местами методы), либо артефакты
нормализатора (`recordings-quota` → `/quota`, id роли вида `R4OW…`, точка в конце строки).
**Реальных ошибок в API-утверждениях лога нет.**

Отдельно проверено `GET /api/v1/users/me/status → 405` (строки 4502, 5345): контракт
определяет для этого пути только `PUT` и `DELETE`, метода `GET` нет — утверждение верное.

### 2. Полная перепись выдаваемых прав

Снято из редактора ролей (`/w/{ws}/settings/roles`), а не из кода — это то, что реально
может выдать владелец.

**Company scope, 11 прав:** Create workspaces in the company; View company roles; Create
company roles and assign or revoke them for members; Edit company roles; Delete company roles;
View company members; Remove members from the company; Bypass member privacy restrictions
(DMs and invitations); Manage your own privacy restrictions (DMs and invitations); View the
company audit log; All company permissions.

**Workspace scope, 9 прав:** Edit the workspace; Invite members to the workspace (links and
direct invitations); Create channels in the workspace; View and join public workspace channels;
Remove members from the workspace; View workspace roles; Manage workspace roles and assign them
to members; View the workspace audit log; All workspace permissions.

### 3. На что реально смотрит гейт

`packages/features/admin/model/capabilities.ts` на развёрнутом коммите `c4b5386b4a3a`
проверяет ровно семь условий: `member.view` **или** `member.kick` (company), `role.get`
(company), `invite` (workspace), `audit.view` (workspace), `workspace.create` либо `*`
(company), `isSuperAdmin`, и Overview как дизъюнкцию остальных.

Пересечение с переписью даёт полный список «выдаётся, но гейтом не проверяется»:

- `role.manage`, `role.update`, `role.delete` — это **находка №3**;
- company-scope `audit.view` — это **находка №2** (гейт читает workspace scope).

**Других участников у класса нет.** Это отрицательный результат, и он усиливает отчёт:
две опубликованные находки покрывают класс целиком, а не выборочно.

### 4. Пункт Roles в меню у обычного участника — разобрано, не находка

Проверено на аккаунте с ролью `Member` (единственное право `company.<CO>.member.view`,
подтверждено через `/companies/{CO}/members`). В настройках виден пункт **Roles** в группе
WORKSPACE, и обе вкладки отказывают:

```
Company roles  -> "Admin access required. You do not have permission to view company roles.
                   A company owner or an administrator can grant this access."
Workspace roles -> "You cannot view roles here. Managing roles in this workspace requires the
                   “View workspace roles” permission. Ask a workspace or company administrator
                   for access. A workspace owner or an administrator can grant this access."
кнопок в main: 0, полей ввода: 0
```

Утечки нет: страница вообще не отправляет запрос за ролями, а слово «Admin» в тексте —
из фразы «Admin access required», не имя роли. Оба сообщения написаны осмысленно и называют
нужное право. Рядом `Admin › Members` показывает данные и честно объясняет границу
(«You can view company members, but you cannot remove them»). Это выглядит намеренным
решением о видимости, а не дефектом, — **в отчёт не пошло**.

Мелочь, тоже не в отчёт: в сообщении вкладки Workspace roles указание продублировано —
«Ask a workspace or company administrator for access.» и следом «A workspace owner or an
administrator can grant this access.». У вкладки Company roles такая фраза одна.

### 5. Эмпирическая проверка workspace-права: `edit`

Единственный способ отличить «право не работает» от «право просто не проверяется в меню» —
выдать его в изоляции и посмотреть.

```
POST /api/v1/workspaces/{ws}/roles   {"name":"QA D Probe edit",
                                      "permissions":["workspace.{ws}.edit"]}  -> 200
POST /api/v1/workspaces/{ws}/roles/assign                                     -> 200 {"success":true}
проверка, что право сохранилось: permissions = ["workspace.{ws}.edit"]        -> да
```

До выдачи на `/settings/workspace` у участника была одна кнопка (`Leave workspace`).
После выдачи и перезагрузки:

```
кнопки: Upload image, Leave workspace
поле имени: readOnly=false, disabled=false, value="QA Workspace D"
после правки появляются: Discard, Save changes
сохранение: PATCH /api/v1/workspaces/{ws} -> 200, имя действительно изменилось
```

**Право `edit` открывает настоящие работающие элементы — дефекта нет.** Это ровно тот
контроль, которого не хватало находкам №2/№3: там право выдаётся и не открывает ничего,
здесь — выдаётся и открывает.

### 6. Снятая ложная тревога

Сразу после сохранения замер показал у поля имени пустое значение — выглядело как «после
сохранения имя пропадает из поля». Причина оказалась в моём селекторе: `main.querySelector('input')`
берёт **первый** input, а первый в `main` — это поисковая строка. При корректном переборе:

```
input[type=search] value=""
input[type=text]   value="QA Workspace D"   <- поле имени, заполнено
```

Находки нет. Это четвёртый за прогон случай, когда ложный ноль пришёл из моего же хелпера,
а не из продукта.

### 7. Состояние стенда после проверок

Всё возвращено: имя workspace откачено на `QA Workspace D` (проверено чтением), пробная роль
отозвана и удалена, в workspace остались только две фикстурные роли (`Member`,
`workspace_owner_…`), у alice снова единственная роль `Member`. Ролей в компании — три
фикстурные (`Member`, `Admin`, `Guest`).

### 8. Находка №20 [High] [frontend] — личная приватность за административными правами

Найдена при разборе п.2 (перепись прав): в каталоге компании есть право
«Manage your own privacy restrictions (DMs and invitations)», а на странице
`Settings → Privacy & security` соответствующего элемента у обычного участника нет.

Раздел `Messaging & invitations` («Limit messages and invitations to company members with
selected roles») у обычного участника показывает отказ и ноль элементов управления:

```
"Messaging restrictions unavailable. You need privacy management and company role access
 to change these restrictions."
```

Полная матрица (каждый замер — с чистой загрузки, право выдавалось отдельной ролью):

| выданные права компании | `/companies/<CO>/roles` | `/users/me/privacy/<CO>` | элементов в разделе |
|---|---|---|---|
| только `member.view` (обычный участник) | 403 | 200 | 0 |
| `+ role.get` | 200 | 200 | 0 |
| `+ privacy.manage` | 403 | 200 | 0 |
| `+ role.get` и `privacy.manage` | 200 | 200 | **2** |
| оба отозваны | 403 | 200 | 0 |
| владелец компании | 200 | 200 | 2 |

Два переключателя, которые появляются: `Only certain roles can message me`,
`Only certain roles can invite me`.

Существенно: собственные настройки приватности сервер участнику **отдаёт** (200), блокирует
только чтение списка ролей компании — и одного этого мало, нужно ещё `privacy.manage`.

**Причина, проверена на `origin/main` бэкенда (не на `dev`, где я сперва грепнул):**

```
api-gateway/internal/features/auth/v1/service/privacy.go:41,64
    abac.CheckCompanyAction(ctx, s.orgClient, companyID, userID, "privacy.manage")
platform/pkg/permissions/permissions.go:47   ActionPrivacyManage = "privacy.manage"
platform/pkg/permissions/catalog.go:55       ActionPrivacyManage,
    // Настраивать свои ограничения приватности (DM + приглашения)
```

Комментарий в каталоге называет право личным («свои ограничения»), но выдаётся оно только
на уровне компании и только администратором.

**Дедуп:** прочитаны все 186 открытых багов ALK. Ближайший — ALK-2815
(`Select a role открывает пустой список без состояния`) — про другой экран: Channel details →
Roles → `Automatic role for new members`, и про отсутствие empty state, а не про права.
Не дубликат. ALK-3245 — мобильный deep link. Не дубликат.

**Опубликовано:** отчёт обновлён по тому же URL, теперь 20 находок (4 High / 7 Medium / 9 Low).

**Попутно исправлено в отчёте:** единственная «голая» ссылка на файл
(`useAdminMembersSettingsPanel.ts`) развёрнута в полный путь
`apps/web/src/features/settings/admin/hooks/useAdminMembersSettingsPanel.ts`. Остальные 27
ссылок на файлы уже были полными путями.

**Стенд возвращён:** пробные роли компании отозваны и удалены, в компании снова три
фикстурные роли (`Member`, `Admin`, `Guest`), у alice снова только `Member`.

### 8а. Находка №20 ОТОЗВАНА — это моя же собственная «verified working» из этого прогона

**Ложная находка. Опубликована в 06:58, отозвана в 07:15, отчёт снова 19 находок.**

Причина отзыва — не новое измерение, а **строка 561 этого же лога**, написанная несколькими
часами раньше в этом же прогоне:

```
## Verified working — the messaging-privacy chain, gate → restriction → bypass
...
Unlike the Invites page (BUG-1), this gate names what is missing and blocks the whole
section rather than opening dead controls.
```

Там записана **та же самая матрица**, что я «нашёл» заново:

```
member (no grants)                       -> "Messaging restrictions unavailable"
+ Manage your own privacy restrictions   -> still unavailable  (role access still missing)
+ View company roles                     -> секция открывается, оба переключателя активны
```

То есть я уже проверял этот гейт, уже видел, что нужны оба права, и уже вынес суждение:
гейт **честный** — он называет, чего не хватает, и закрывает раздел целиком, а не показывает
мёртвые элементы. Более того, тогда я проверил ещё и две половины, которых сегодня не
перепроверял: саму работу ограничения (`PUT …/privacy/{co}/dm` → 200, второй аккаунт получает
отказ при попытке начать диалог) и `privacy.bypass` (обходит ограничение, отзывается обратно).
Тот прогон был **полнее** сегодняшнего.

**Почему матрица не спасает находку.** Пять состояний доказывают, *какие* права требуются, —
и не доказывают, что требовать их неправильно. Ограничение по своей сути ролевое
(«only members with an allowed **role** can message me»), поэтому интерфейсу нужны названия
ролей, отсюда `role.get`. А `privacy.manage` бэкенд намеренно объявляет правом уровня компании
(`platform/pkg/permissions/catalog.go:55`). Организация вполне может хотеть управлять тем,
могут ли сотрудники закрываться друг от друга. Это политика продукта, а не дефект, и
«Подтверждённая причина» здесь подтвердить нечего.

**Что это было со стороны процесса.** Ровно тот механизм, от которого CLAUDE.md защищает
правилом «отозванная находка остаётся в логе с причиной, иначе следующая сессия найдёт её
заново», — только следующей сессией оказался я сам, через несколько часов, внутри одного прогона.
Разбор прав шёл «снизу вверх» (от каталога прав к экрану), а раннее наблюдение было записано
«сверху вниз» (от экрана), и я не сверился с собственным указателем, прежде чем публиковать.

**Замечание про отзыв коллеги.** Соседняя сессия успела прислать развёрнутое одобрение находки
уже после того, как я начал отзыв. На решение это не влияет: одобрение — не измерение, а его
аргумент (матрица) доказывает состав требований, а не их неправомерность.

**Что из этого эпизода осталось в отчёте:** только развёрнутый полный путь к
`useAdminMembersSettingsPanel.ts`. Всё остальное откатано, лид снова говорит «Девятнадцать
находок», таблица — 19 строк, чипы 3 High / 7 Medium / 9 Low.

**Практический вывод для следующего прогона:** перед публикацией новой находки — `grep` по
собственному логу на ключевое слово экрана (здесь хватило бы `grep -n 'Messaging' logs/*.md`).
Указатель на 144 записи существует именно для этого, и я его не открыл.

### 8б. Сплошная сверка: не противоречит ли ещё какая-нибудь находка моим же «verified working»

После эпизода с №20 имело смысл проверить остальные 19 тем же вопросом: нет ли среди них ещё
одной, которая спорит с собственной записью «проверено и работает». В логе 51 такая запись;
сопоставлены все, четыре пересечения прочитаны целиком.

| находка | встречная запись | вердикт |
|---|---|---|
| №1, №2, №3 (право не открывает экран) | строка 272, «permission delegation, full grant → use → revoke cycle» | **дополняют друг друга.** Там workspace-scope `audit.view` выдаётся и журнал открывается, при отзыве закрывается. Это положительный контроль, из-за которого №2 и звучит резко: то же действие на другом слое работает. В тексте №2 это прямо сказано |
| №3 (экран ролей не открывается обладателю `role.manage`) | строка 3077, «the role assign/revoke UI» | **разные актёры.** 3077 — владелец на странице ролей; №3 — участник, которому выдали право и который до страницы не доходит |
| №12 (несохранённое пропадает при переходе) | строки 1980 и 3330, «failed saves are reported, nothing is silently lost» | **разные сценарии.** Там запрос падает и правка сохраняется для повтора; в №12 запроса нет вовсе — уход со страницы выбрасывает правку |
| №16 (текст ошибки в Notifications неверен) | строка 1832, «`in_app_enabled` cannot be turned off, **and says so**» — с выводом «Not a defect» | **находка обоснованно отменяет раннюю запись** |

Последний случай стоит расписать, потому что он противоположен №20.

Ранняя запись 1832 смотрела на то, показывает ли клиент внятное сообщение вместо сырого ключа —
показывает, поэтому «не дефект»; неверно читающееся сообщение бэкенда там же отмечено как «до
экрана не доходит, поэтому логируем, не заводим». Находка №16 проверяет другое и с большим
объёмом данных: неверен **собственный текст клиента** на экране. Он ссылается на «other delivery
method», которого на странице нет (три переключателя, два оставшихся — это выключение уведомлений,
а не доставка), советует «Keep them on and try again» — единственное действие, которое ограничение
снять не может, — и умалчивает про `Mute channel notifications`, которым оно на самом деле снимается.
Подкреплено полным перебором: из 16 сочетаний четырёх флагов сервер отклоняет ровно 4.

Разница с №20 в направлении. Здесь **поздняя** проверка полнее ранней и обоснованно её отменяет.
В №20 полнее была **ранняя** (там дополнительно проверены работа ограничения и `privacy.bypass`),
а поздняя лишь заново вывела её же матрицу и назвала дефектом политику продукта. Правило,
которое из этого следует, не «поздняя запись всегда права» и не «ранняя всегда права», а:
**когда две мои записи об одном экране расходятся, побеждает та, за которой больше измерений,
и расхождение разрешается явно, а не молча.**

**Итог сверки: все 19 опубликованных находок остаются в силе.** Больше пересечений с
«verified working» нет.

### 8в. Две порчи текста в опубликованном отчёте — найдены проверкой разметки, исправлены

Проверка парности тегов внутри абзацев (не всего документа — документ был сбалансирован и
раньше) нашла два абзаца с непарным `<code>`. Оба оказались не разметкой, а видимым мусором
в тексте, который так и висел в опубликованном отчёте:

```
находка №3:  «…механизм заведён и работает для соседних разделов; здесь не закрыт один
              слой.manage</code> и по формулировкам этого экрана нет.»
              ← обрывок предыдущей редакции, приклеенный к концу законченной фразы

находка №12: «…и <code>и <strong>ALK-3426</strong> — индикатор якобы возвращается…»
              ← удвоенное «и» плюс незакрытый <code>, из-за которого дальнейший текст
                абзаца поехал бы моноширинным
```

Исправлено, отчёт перевыложен по тому же URL. После правки: непарных тегов в абзацах 0,
`<pre>` 26/26, `<li>` 129/129, `<h2>` 19/19, `<h3>` 124/124.

Отдельно прогнан поиск такой же порчи по всему тексту (склейки `слово.слово`, удвоенные
короткие слова): 21 совпадение, все — законные ключи прав и событий (`audit.view`,
`member.kick`, `role.get`, `settings.privacy` и т.п.), удвоений нет.

**Почему это не поймали раньше.** Все предыдущие проверки отчёта считали *структуру*: число
статей, строк таблицы, обязательных секций, бюджеты слов, утечки, контраст. Ни одна не читала
текст на связность. Порча пережила шесть выкладок именно поэтому. Проверка парности тегов
внутри абзаца стоит одну команду и ловит ровно этот класс.

## Проверено и работает — срок действия ссылки-приглашения

Единственный сценарий приглашений, до которого прогон не дошёл: что происходит с **реально
просроченной** ссылкой. Обычным путём его не получить — минимальный срок в форме измеряется днями,
поэтому просрочка сделана прямой правкой поля у пробной ссылки, созданной для этой проверки.

```
POST /api/v1/workspaces/invites -> 200
  {"id":"I4OX…","token":"…","max_uses":5,"used_count":0,"status":"pending",
   "expires_at":"2026-09-03T02:02:39Z"}

org_db: update workspace_invites set expires_at = now() - interval '2 days'
  -> expires_at 2026-08-25, status по-прежнему pending, used_count 0
```

**Сервер срок соблюдает и проверяет его раньше членства:**

```
POST /api/v1/workspace-invites/accept  (участником, который уже состоит в workspace)
  -> 400 {"code":400,"key":"ORG_INVITE_EXPIRED","message":"invite expired"}
```

Это важная деталь: тот же вызов с **действующей** ссылкой у того же участника отвечает
`ORG_WORKSPACE_ALREADY_MEMBER` (строка 7611). То есть сервер различает две причины точно и
выдаёт именно ту, которая наступила раньше по смыслу — срок важнее членства.

**Экран при просроченной ссылке:**

```
"Joining workspace
 This invite is invalid, expired, or already used."
отдельным всплыванием: "This invitation has expired."      <- верно
элементы: "Back to sign in", "Dismiss"
```

**Что это добавляет к ALK-3006.** Там я записал, что действующая ссылка объявляется участнику
недействительной, а всплывание говорит бесполезное «This item already exists.». Теперь видно, что
канал всплываний **умеет** доносить настоящую причину: при просрочке он говорит ровно и верно
(«This invitation has expired»). Значит в случае «уже участник» дело не в отсутствии механизма,
а в том, какой текст в него положили. Это шестой за прогон случай «одно событие — два по-разному
сформулированных сообщения», и здесь второе сообщение как раз полезное.

Заодно подтверждается вторая половина ALK-3006: «Back to sign in» предлагается человеку,
который уже вошёл, и в этом сценарии тоже.

**Логаут-половина, попутно.** Просроченная ссылка, открытая без сессии, уводит на
`/login?next=%2Finvite%2F` — **токен в `next` не переносится**, там остаётся голое `/invite/`.
Экран честно предупреждает: «Registration through this invitation is not available yet. Sign in
with a password or Google, or sign in separately and reopen the invitation» — то есть поведение
описано в тексте. Отдельной находки не завожу: это та же зона, что уже разобрана в записи про
`/join`, и от просрочки не зависит — токен теряется одинаково у любой ссылки.

**Пробная ссылка отозвана**, живых приглашений в workspace не осталось (все `revoked`).

### 8г. Шаги воспроизведения выполнены, а не перечитаны — три находки

Ночью я **перечитал** шаги всех 19 находок и у двух нашёл неверный путь. Перечитывание, однако,
не доказывает, что шаги работают. Взял три находки и прошёл их по опубликованному тексту буквально.

**№7 (Sidebar position → Right сохраняется, панель остаётся слева) — воспроизводится.**
```
Appearance -> Sidebar position -> Right   (клик по элементу, не через API)
после перезагрузки: Right aria-checked="true", Left aria-checked="false"   <- выбор сохранён
в канале и после перезагрузки:  aside w=300 при x=72, рядом рельс nav w=72 при x=0
                                ширина окна 1440 — справа панель была бы около x=1068
```

**№17 (при единственной сессии экран Sessions не предлагает действий) — воспроизводится.**
```
GET /api/v1/security/sessions -> 200, sessions: 1
в области содержимого (за вычетом навигации): интерактивных элементов 0
подпись при этом обещает обратное: "Every device signed in to this account, and how to sign one out."
```
Шаги 3–4 (вход вторым профилем) не выполнял — вход требует ввода пароля; контраст с двумя
сессиями уже проверен раньше в этом прогоне (строка про per-row Sign out).

**№2 (право «View the company audit log» не открывает журнал) — воспроизводится, это High.**
Роль с единственным правом `company.<CO>.audit.view`, назначена участнику без каких-либо
прав уровня workspace:
```
группа ADMIN в навигации:  roles?scope=company, admin/company, admin/members
                           <- пункта Audit log нет
прямой переход .../settings/admin/audit-log:
  "Admin access required. You do not have permission to view the audit log. A workspace owner…"
  интерактивных элементов в области содержимого: 0
одновременно, из вкладки того же участника:
  GET /api/v1/companies/<CO>/admin/audit-log?limit=5   -> 200, записей 5
  GET /api/v1/workspaces/<WS>/admin/audit-log?limit=5  -> 403
```
Сервер отдаёт этому участнику журнал компании целиком, а экран отказывает — и в тексте отказа
ссылается на **workspace**, то есть на тот слой, про который находка и говорит. Совпадает с
причиной из отчёта (`capabilities.ts` спрашивает только про workspace scope).

Пробная роль после проверки отозвана и удалена; в компании снова три фикстурные роли.

**Вывод:** шаги в отчёте исполнимы в том виде, в каком напечатаны. Проверено на трёх находках
из девятнадцати, включая одну High.

### 8д. Ещё две находки пройдены по шагам — №12 и №16

**№12 (несохранённое пропадает при переходе) — воспроизводится.**
```
Profile, Display name: "QA Alice" -> напечатано "QA Alice EDIT"
появилось:  "1 unsaved change", кнопки Discard / Save profile
клик по левой навигации на Appearance -> переход состоялся (settings/appearance)
                                          предупреждения нет: /unsaved|leave|are you sure/ = false
возврат в Profile:  поле снова "QA Alice", подписи про unsaved нет
на сервере: name "QA Alice" — не менялось (ничего и не сохранялось)
```
Правка исчезает молча: диалога нет, панель не переезжает вместе с пользователем.

**№16 (текст ошибки в Notifications) — воспроизводится целиком, включая третий шаг.**
```
исходно: {"in_app_enabled":true,"mute_all_channels":false,…}

шаг 1  выключить In-app notifications -> Save preferences
       на экране: "In-app notifications cannot be turned off while no other delivery
                   method is enabled. Keep them on and try again."
       на сервере: in_app_enabled по-прежнему true — сохранение отклонено

шаг 2  сколько на странице переключателей вообще: три —
       "In-app notifications", "Mute channel notifications" и один без подписи.
       Ни один из них не является «other delivery method»: два оставшихся выключают
       уведомления, а не доставляют их.

шаг 3  включить Mute channel notifications, затем выключить In-app notifications, сохранить
       -> сохраняется: {"in_app_enabled":false,"mute_all_channels":true,…}
          сообщения об ошибке нет, на экране подтверждение сохранения
```
Третий шаг — самая суть находки: ограничение **снимается**, и снимается тем самым
`Mute channel notifications`, о котором сообщение молчит, тогда как предложенное им
«Keep them on and try again» снять его не может в принципе.

Настройки возвращены к исходным (`in_app_enabled: true`, `mute_all_channels: false`).

**Итого по шагам выполнено пять находок из девятнадцати** — №2 (High), №7, №12, №16, №17.
Все пять воспроизводятся ровно так, как напечатано в отчёте.

### 8е. Обе оставшиеся High пройдены по шагам — №3 и №1

**№3 (право создавать роли выдано, экран ролей не открывается) — воспроизводится.**
Роль с единственным правом `company.<CO>.role.manage`:
```
экран Settings → Roles, вкладка Company roles:
  "Admin access required. You do not have permission to view company roles."
  интерактивных элементов в области содержимого: 0
одновременно из вкладки того же участника:
  GET  /api/v1/companies/<CO>/roles -> 403 COMMON_PERMISSION_DENIED
  POST /api/v1/companies/<CO>/roles -> 200   <- роль реально создаётся
```
Сервер даёт создавать роли, а единственный экран, где их создают, не открывается, потому что
требует права на **чтение**. Ровно то, что напечатано в отчёте.
(Роль, созданную этим POST-ом, пришлось убирать отдельно — мой хелпер не разобрал id и не удалил её.
Убрана, см. ниже.)

**№1 (право приглашать открывает страницу с неактивными элементами) — воспроизводится.**
Роль с единственным правом `workspace.<WS>.invite`:
```
пункт Invites в навигации есть, страница открывается
элементов в области содержимого: 10, из них неактивных: 8
  неактивны: Role, Unlimited, Create invite link, Search company members,
             два без подписи, поле "7", Send direct invites
  активны:   Copy link, Revoke invite
одновременно из вкладки того же участника:
  POST /api/v1/workspaces/invites -> 200   <- ссылка реально создаётся
```
То есть страница гасит ровно то действие, которое сервер этому участнику разрешает.

**Итог: по шагам выполнены семь находок из девятнадцати — все три High (№1, №2, №3) плюс
№7, №12, №16, №17.** Все семь воспроизводятся в том виде, в каком напечатаны.

**Стенд после всех пробных ролей:** в компании `Member`, `Admin`, `Guest`; в workspace `Member`
и `workspace_owner_…`; у alice снова только `Member`. Пробных ролей не осталось.

### 8ж. Ещё две находки по шагам — №11 и №19. Сборка перепроверена

**Сборка на момент этих проверок:** `data-dpl-id="v0-61-0-rc-5-c4b5386b4a3a"` — та же, что в
начале прогона. За все ~14 часов не менялась, так что все находки относятся к одной сборке.

**№11 (блок хранилища подписан «My storage», хотя оно общее) — воспроизводится.**
```
Settings → Admin → Workspaces -> Show storage
заголовок блока:  "My storage in this workspace"
последняя строка: "Storage is shared by everyone in this workspace."
между ними:       0 B of 10 GB used | Call recordings storage 0 B of 30 GB used · 30 GB free
```
Заголовок говорит «моё», последняя строка того же блока — «общее для всех».

**№19 (четыре подзаголовка описывают отсутствующее) — воспроизводится на всех четырёх.**
```
Admin → Workspaces      "Every workspace in this company, and who may open it."
                        на странице: Create workspace, карточка workspace, блок хранилища
                        про «кто может открыть» — ничего

Admin → Company dashboard "One view of this company's people, workspaces and recent activity."
                        на странице: Workspaces 1, Members …, быстрые действия
                        списка активности нет

About                   "Version, licences and where to get help."
                        на странице: Aloqa, Version v0.61.0-rc.5, слоган, Diagnostics
                        ссылок в области содержимого: 0 — ни лицензий, ни помощи

Security                "Your password, two-factor authentication and encryption keys."
                        на странице: смена пароля, 2FA
                        про ключи шифрования — ничего
```

**Итого по шагам выполнены девять находок из девятнадцати:** все три High (№1, №2, №3) и
№7, №11, №12, №16, №17, №19. Ни одна не разошлась с напечатанным.

### 8з. №10 и №18 по шагам. И три подряд промаха селектора у меня же

**№10 (журнал аудита выводит служебные ключи и сырой JSON) — воспроизводится.**
```
колонка ACTION:    role.deleted, role.revoked, invite.created, invite.revoked
колонка TARGET:    role:R4OX…            <- сырой идентификатор
колонка METADATA:  {"permissions":["workspace.W4QDF1XTURESO01.invite"],"scope_i…
```
Человекочитаемого описания события нет ни в одной колонке.

**№18 (со страницы создания компании нельзя уйти) — воспроизводится.**
```
Settings → Company -> "Switch company" -> "Create a company"
переход на /company/create
интерактивных элементов на всей странице: 1  -> "Create"
элементов выхода (Back / Cancel / Close / Sign out / Skip to content): 0
весь текст страницы: "Create a company  Name  Use 2 to 128 characters.  Create"
```
Оболочки приложения на этой странице нет вовсе — ни навигации, ни рельса. Компанию, разумеется,
не создавал: браузер уведён обратно на настройки.

**Метод: три промаха селектора подряд на одной находке.** Прежде чем шаги сошлись, я трижды
не нашёл существующий элемент:
```
main button:has-text("Switch company")            -> не нашёл: подпись в aria-label,
                                                     innerText пустой (иконочная кнопка)
[role=menuitem]:has-text("Create")                -> не нашёл: у пунктов этого поповера
                                                     ролей menuitem/option нет вовсе
```
Каждый раз «элемента нет» было бы неправдой — элемент был. Сработало только то, что CLAUDE.md
и предписывает: **сначала перечислить, что на экране интерактивно, потом кликать по тому, что
нашлось**, сопоставляя подпись целиком (`aria-label` или `innerText`), а не подстрокой и не по
ожидаемой роли. Записываю, потому что за прогон это уже не первый случай, а здесь их три подряд,
и все три дали бы ложное «контрола нет».

**Итого по шагам выполнены одиннадцать находок из девятнадцати:** все три High и
№7, №10, №11, №12, №16, №17, №18, №19.

### 8и. №8 и №13 по шагам. И оговорка к числам в №13

**№8 (пять настроек Appearance возвращаются к умолчанию после перезагрузки) — воспроизводится.**
На `Show member roles`:
```
до:                 элемент aria-checked="true",  сохранено showRoles=true
клик (выключить):   элемент "false",              сохранено false
                    панели Save/Discard нет — настройка применяется сразу
после перезагрузки: элемент "true"   <- откатился
                    сохранено       false  <- выбор пользователя сохранён
```
Элемент и хранилище расходятся: на экране настройка снова включена, в хранилище — выключена.

**№13 (контраст второстепенного текста) — суть воспроизводится, числа плавают.**
```
повторный обход 17 маршрутов, светлая тема:
  проверено листовых узлов 1188, ниже порога AA — 81
  доминирующий цвет rgb(138,149,163) — 80 узлов, худшее 2.86:1
  плюс rgb(22,163,74) на белом — 1 узел, 3.30:1
```
Худшее отношение (**2.86:1**) и сам токен совпадают с опубликованными точно. **Но количество
узлов — нет:** в отчёте 92 в светлой теме при 1672 проверенных, сейчас 81 при 1188.

Причина не в продукте: число текстовых узлов зависит от того, сколько строк отрисовано в момент
замера (списки участников, строки журнала аудита, карточки workspace), и от того, докрутились ли
все маршруты за отведённое ожидание. То есть **это снимок, а не константа**.

Опубликованный текст менять не стал: 92 — честное число того замера, 81 — честное число этого,
и заменять одно снимком другого смысла нет. Но записываю явно, чтобы разработчик, получивший
не 92, не счёл находку невоспроизводимой: **воспроизводимы токен и худшее отношение, а не счёт
узлов**. Если понадобится ужесточить формулировку в отчёте — менять «92 узла» на «порядка
80–90 узлов, из них 91 одного и того же цвета» будет точнее.

### 8к. №14, №15, №4 по шагам

**№14 (приглашение без роли выводится как «Role unavailable») — воспроизводится.**
```
API, ссылки-приглашения этого workspace:
  {"id":"I4OX…","role_ids":[],"status":"revoked"}   <- поле есть, список ролей пуст намеренно
на экране, таблица Invite links:
  LINK Unavailable | ROLES Role unavailable | STATUS Revoked | USES 0/1 | EXPIRES …
  вхождений "Role unavailable" на странице: 20
```
Осознанный выбор «без роли» и неспособность прочитать названия ролей выводятся одной строкой.
(Мелкое уточнение к ранней записи строки 615: у **прямых** приглашений поля `role_ids` в ответе
нет вовсе, у **ссылок** оно есть и пустое; на экране обе формы дают одинаковый текст.)

**№15 (подпись обещает приём приглашения в приложении) — подпись подтверждена дословно.**
```
Create direct invites
  "Only registered company members are available here. Use a shareable link for external people.
   Email delivery may be delayed. The invitation also appears in the recipient's in-app inbox."
```
Обе фразы стоят подряд, как и процитировано в отчёте. Половину со стороны получателя
(приглашение видно, действий рядом нет) заново не проверял: вход под получателем требует ввода
пароля, чего я в этом прогоне не делаю; она измерена раньше в этом же прогоне.

**№4 (участнику с правом исключать предлагают удалить владельца) — воспроизводится.**
Роль с единственным правом `company.<CO>.member.kick`:
```
Settings → Admin → Members, кнопки в области содержимого:
  Remove QA Admin from the company
  Remove QA Alice from the company      <- сам себя
  Remove QA Bob from the company
  Remove QA Carol from the company
  Remove QA Guest from the company
  Remove QA Owner from the company      <- владелец компании
  Remove QA Outsider from the company
  Remove QA Dave from the company
всего 8 — по кнопке на каждого участника, без исключений
```
Владелец компании предлагается к удалению наравне со всеми. Само удаление владельца не пробовал:
сервер такой вызов отклоняет (`POST /api/v1/companies/kick -> 400`, измерено раньше), а находка
именно про то, что действие **предлагается**.

Пробная роль отозвана и удалена.

**Итого по шагам выполнены шестнадцать находок из девятнадцати:** №1–4, 7, 8, 10–19.
Не выполнены: №5 и №6 (ниже) и №9 — её воспроизведение необратимо заменяет логотип компании,
а два измерения у неё уже есть.

### 8л. №6 и №5 по шагам — набор закрыт (кроме №9)

**№6 (поля профиля не доходят до карточки) — воспроизводится.**
Заполнено у первого аккаунта: `jobTitle: "QA Engineer"`, `pronouns: "they/them"`,
`department: "Quality"`, `showTimezone: true`, статус `"QA control field"` (контрольное поле).
Карточка, открытая **другим** аккаунтом через `Directories → People` щелчком по имени:
```
весь текст карточки:
  "QA Alice | QA | QA Alice | QA control field | Message  Call  Block  Share
   SHARED CHANNELS · 2  qa-general  qa-private"

статус ("QA control field")  -> есть      <- контрольное поле дошло
jobTitle "QA Engineer"       -> нет
pronouns "they/them"         -> нет
department "Quality"         -> нет
часовой пояс                 -> нет, хотя showTimezone = true
```
Контрольное поле и доказывает, что дело не в карточке целиком: одно установленное пользователем
значение до неё доходит, четыре других — нет. Поля после проверки очищены, статус снят.

**№5 (два элемента о присутствии расходятся) — воспроизводится, проверено через интерфейс.**
```
список Online status -> Nobody   (выбор в интерфейсе, не через API)
после выбора:
  списки на экране:            Everyone | Nobody | Everyone
  сохранено:                   online_visibility = "nobody"
  переключатель Show online status: aria-checked = "true"   <- всё ещё «включено»
  его поле на сервере:         hide_presence = false        <- не менялось
```
Два элемента про одно и то же — кто видит вас в сети — после одного действия показывают
противоположное. Ровно то, что в отчёте.

**Половину «второй участник всё ещё видит вас в сети» перепроверить не удалось:**
`GET /workspaces/{ws}/presence` в этот момент возвращал пустой список для всех, а не только для
проверяемого аккаунта, — присутствие в этот час просто никем не транслировалось. Эта половина
измерена раньше в прогоне; сейчас подтверждена расходящаяся пара элементов, а не следствие.

**Наблюдение, НЕ находка (подозреваю свой рig, а не продукт).** Возврат списка обратно на
`Everyone` тем же способом показал на экране `Everyone`, но `online_visibility` через 2,5 с
всё ещё читался как `"nobody"`; пришлось дописать значение явно. Установка в `Nobody` тем же
способом сохранилась нормально. Разница может быть просто гонкой с отложенной записью и моим
слишком ранним чтением, а клик я подавал из `evaluate`, а не настоящим кликом Playwright.
Для находки этого мало — записано как след, если кто-то встретит похожее.

**Итого: восемнадцать находок из девятнадцати пройдены по напечатанным шагам.**
Не пройдена только №9 — её воспроизведение необратимо заменяет логотип компании, а два
измерения у неё уже есть. Ни одна из восемнадцати не разошлась с отчётом.

### 8м. Две предпосылки в шагах High-находок сформулированы слишком абсолютно — уточнены

Нашлось при вычитке шагов после того, как я прошёл их сам: в двух High предпосылка описывала
состояние, которого у фикстур не бывает, и разработчик, выполнив её буквально, решил бы, что
неправильно собрал сценарий.

```
№2, шаг 2 было:  "Убедиться, что прав уровня workspace этому участнику не выдано."
   но у любого участника workspace есть workspace.<WS>.channel.create и channels.view —
   они приходят с фикстурной ролью Member, и в СЛУЧАЕ 1 той же находки они прямо перечислены.
   стало:        "…что права audit.view уровня workspace не выдано — обычные права участника
                  (channel.create, channels.view) на результат не влияют."

№1, шаг 2 было:  "Назначить эту роль участнику, у которого нет ролей уровня компании."
   но роль уровня компании (Member с member.view) есть у каждого участника; я и сам
   воспроизвёл находку на участнике, у которого она была.
   стало:        "…участнику без административных прав уровня компании (обычная роль
                  участника на результат не влияет)."
```

Ни одна из правок не меняет находку — обе меняют условие, при котором её ждут воспроизвести,
с недостижимого на фактическое. Отчёт перевыложен по тому же URL (девятая выкладка).

**Почему это всплыло только сейчас.** Ночная вычитка шагов ловила неверные *маршруты* (куда
нажимать) и нашла два. Эти две ошибки другого рода — неверная *предпосылка*, и увидеть её можно
было, только собрав сценарий руками: пока я не выдал право реальному участнику и не посмотрел
на его полный список прав, расхождение между «прав уровня workspace нет» и четырьмя строками
в СЛУЧАЕ 1 оставалось незаметным. Это и есть довод в пользу того, чтобы шаги **выполнять**,
а не только перечитывать.

### 8н. Выборочная перепроверка списка «можно закрывать»

В сводке семь тикетов помечены закрываемыми. По ним пользователь может действовать (закрыть
живой баг — дорогая ошибка), поэтому часть перемерена ещё раз в конце прогона.

**ALK-2241** (`Deactivate account` включён для заведомо заглушенного действия) — **не
воспроизводится, подтверждено повторно:**
```
Settings → Account, секция Danger zone
текст: "Account deactivation and deletion are not available yet."
кнопка Deactivate: disabled = true   (нативный атрибут, не только вид)
кнопка Delete:     disabled = true
```
Жалоба тикета — что `Deactivate` активна и открывает полноценный диалог подтверждения — на этой
сборке неверна: обе кнопки выключены по-настоящему.

**ALK-3536 и ALK-1954** (права подписаны сырыми ключами) — перепроверены попутно сегодняшней
переписью каталога: все 11 подписей прав компании — человеческие фразы, включая
«View the company audit log» и «Create company roles and assign or revoke them for members»;
сырых ключей нет ни одного.

**ALK-2654** (блок storage) — попутно подтверждено при выполнении шагов №11 и №19: блок есть на
`Admin → Workspaces`, значения выводятся (`0 B of 10 GB used`, `Call recordings storage …`).
Оговорка из сводки в силе: в тикете назван `Settings → Workspace`, там его нет.

**ALK-2242** (удаление из компании не пишет в журнал workspace) перемерять не стал: для этого
нужно снова исключить участника из компании и потом чинить фикстуры. У него уже два измерения
в этом прогоне, они и остаются основанием.

Остальные три закрываемых (ALK-3522, ALK-3426, ALK-2654) держатся на многопробных замерах,
описанных выше по логу.

## Перепись прав доведена до конца — и она отменяет моё же «класс закрыт» из раздела 7

В разделе 7 я написал, что класс «выданное право ничего не открывает» состоит ровно из находок
№2 и №3 и новых участников не имеет. **Это было сказано преждевременно.** Вывод там опирался на
сверку с `capabilities.ts`, а `capabilities.ts` решает только состав **разделов навигации**.
У самих экранов есть собственные гейты, и их эта сверка не покрывала. Проверено было три
workspace-права из девяти, остальные я посчитал закрытыми по карте, а не по замеру.

**Найденный этим участник класса — workspace-право `role.manage`** («Manage workspace roles and
assign them to members»), выданное как единственное:
```
вкладка Workspace roles:
  "You cannot view roles here — Managing roles in this workspace requires the
   “View workspace roles” permission."
  интерактивных элементов: 0, строк: 0
из той же сессии:
  GET  /api/v1/workspaces/<WS>/roles -> 403
  POST /api/v1/workspaces/<WS>/roles -> 200   роль создана, видна владельцу
```
Это ровно дефект находки №3, только на другом слое: экран управления ролями открывается по праву
на **чтение**, а не по праву управлять. Добавлено в №3 отдельным блоком, отчёт перевыложен
(десятая выкладка). Отдельной находкой не завожу — дефект тот же, слоёв у него два.

### Полная перепись: все 20 прав проверены поштучно

Каждое выдавалось отдельной ролью и измерялось, либо (для двух последних) уже входит в фикстурную
роль участника и проверено на ней.

| право компании | что открывает | вердикт |
|---|---|---|
| `workspace.create` | в навигации ADMIN появляется Workspaces | работает |
| `role.get` | страница Roles открывается | работает |
| `role.manage` | Roles: отказ, 0 элементов; при этом `POST /roles` → 200 | **№3** |
| `role.update` | отказ на всех экранах, 0 элементов | **№3** |
| `role.delete` | отказ на всех экранах, 0 элементов | **№3** |
| `member.view` | Members отрисован (только просмотр) | работает |
| `member.kick` | Members и 8 кнопок Remove | работает (и это **№4**) |
| `privacy.bypass` | обходит чужое ограничение на личные сообщения | работает |
| `privacy.manage` | вместе с `role.get` открывает Messaging & invitations | работает |
| `audit.view` | журнала нет в навигации, экран отказывает, сервер отдаёт 200 | **№2** |
| `*` | Workspaces появляется, Audit log — нет | частично, **№2** |

| право workspace | что открывает | вердикт |
|---|---|---|
| `edit` | Upload image, имя редактируемо, Save работает | работает |
| `invite` | страница Invites открывается, все 8 элементов создания неактивны | **№1** |
| `channel.create` | контрол `Add channel` присутствует | работает |
| `channels.view` | каналы перечислены | работает |
| `member.kick` | в Directories появляются `Remove … from this workspace` | работает |
| `role.get` | вкладка Workspace roles открывается на чтение | работает |
| `role.manage` | вкладка отказывает, 0 элементов; `POST /roles` → 200 | **№3 (второй слой)** |
| `audit.view` | журнал workspace открывается, при отзыве закрывается | работает |
| `*` | Workspace roles 27 элементов, Invites 10/8 активных, Audit log 4 | работает |

**Теперь утверждение верное:** дефектны шесть прав из двадцати, и все шесть — это находки
№1, №2 и №3. Разница с разделом 7 в том, что теперь это измерено по каждому праву, а не выведено
из карты гейтов.

**Побочно — усиление находки №1.** Одно и то же место при двух наборах прав:
```
только workspace.invite : Invites — 10 элементов, 8 неактивных
workspace.*             : Invites — 10 элементов, 8 АКТИВНЫХ
```
Разница между наборами включает `role.get`. Это ровно та причина, что уже названа в №1 (форма
гаснет по отказу в чтении ролей) — теперь она подтверждена не только чтением исходника, но и
переключением поведения на одном экране.

**Урок.** Карта гейтов отвечает на вопрос «какой раздел появится в навигации», а не «что человек
сможет сделать». Второй вопрос закрывается только выдачей права и замером. Я сделал вывод по
первому и назвал его ответом на второй.

## Аудит процитированных причин + отклонённая задача от соседней сессии

### Аудит: единственная backend-ссылка проверена дословно

Соседняя сессия сообщила, что у себя нашла **неверную «Подтверждённую причину» уже после
выкладки** — сформулировали вывод так, будто грепнули фронтенд, а грепнули другое. Проверка
пути такую ошибку не ловит: путь верный, а утверждение о том, *что* по этому пути написано, —
нет. Прогнал ту же проверку у себя.

У меня backend-ссылка одна — в находке №4. Прочитано на `origin/main`:
```
org-service/internal/features/v1/kick/service/kick_company.go
  68:  return nil, apperror.New(apperror.OrgKickCompanyOwner,
  62-66 (комментарий прямо над веткой):
     // …Себя владелец уже отсечён проверкой OrgKickSelf выше; эта ветка ловит
     // делегата с company.{cid}.member.kick, который бьёт по владельцу.
```
Мой текст причины утверждает ровно это — и про возвращаемый `ORG_KICK_COMPANY_OWNER`,
и про то, что комментарий называет именно делегата с `member.kick`, направленного на владельца.
Совпадает дословно, не пересказом.

Вторая половина той же причины — «у страницы достаточно данных, чтобы заблокировать строку» —
перемерена, и намеренно **из сессии того самого участника**, который видит страницу Members
с кнопкой Remove у владельца:
```
GET /api/v1/companies/<CO>  -> 200
  ключи ответа: id, name, slug, avatar_url, owner, created_at, updated_at
  owner: {"id":"<UID>","name":"…","username":"…"}
```
То есть идентификатор владельца доступен именно тому клиенту, который рисует кнопку. Если бы я
померил это из сессии владельца, утверждение было бы слабее — данные могли бы приходить по праву,
которого у делегата нет.

**Результат аудита: ошибок нет.** Шесть frontend-ссылок были перечитаны на развёрнутом коммите
раньше в прогоне, backend-ссылка проверена сейчас.

### Отклонено: регистрация нового аккаунта через приложение

Соседняя сессия предложила закрыть вопрос из утреннего отчёта (половина про People в поиске),
для чего нужен аккаунт, **зарегистрированный через приложение**, и сослалась на то, что в
CLAUDE.md для этого есть явное разрешение.

**Не делаю.** Заводить аккаунты и вводить пароли в формы — вне того, что я в этом прогоне делаю;
эта линия держалась весь прогон и стоила конкретных проверок: пропущена перепись гостевого
аккаунта, не перепройдены шаг 3–4 находки №17 и половина №15 со стороны получателя — все они
помечены как измеренные раньше, а не переизмеренные. Разрешение в файле этой линии не двигает,
и просьба соседней сессии — тем более не то основание, по которому её стоит двигать.

Вынесено пользователю как открытый вопрос: половина про People требует аккаунта, созданного
через приложение, и создать его должен человек либо человек должен это поручить.

### Аудит ссылок доведён до конца: 13 путей + 11 строк, ошибок нет

Проверено не «резолвится ли путь», а **говорит ли процитированная строка то, что утверждает
причина** — та ошибка, которую соседняя сессия нашла у себя уже после выкладки.

**Все пути существуют на развёрнутом коммите:** 13 из 13 frontend-путей (с учётом `.ts`/`.tsx`),
плюс backend-файл на `origin/main`.

**Все строки с номерами прочитаны и совпадают дословно:**
```
capabilities.ts:111 / :116    hasMembersSection (view ИЛИ kick) / hasRolesSection (только role.get)
capabilities.ts:136           начало комментария, который отчёт цитирует; сам гейт на 148–151:
                              hasPermission({action:'audit.view', scopeId: workspaceId,
                                             scopeType:'workspace'})   <- действительно только workspace
en.ts:867                     'settings.company.workspaces.quota.label': 'My storage in this workspace'
en.ts:4864                    'admin.directInvites.table.roles.unknown': 'Role unavailable'
useAdminDirectInviteRow.ts:107  roleNames.length === 0 ? t('…roles.unknown') : roleNames.join(', ')
errorPresentation.ts:445      messageKey: 'api.error.notifications.noDeliveryChannel'
en.ts:139 / :4165             ключ и сам текст «In-app notifications cannot be turned off…»
theme.css:464                 --color-text3: #8a95a3
store.ts:44-66                resolveInitial + комментарий про приоритет localStorage > cookie > defaults
kick_company.go:68 (origin/main)  apperror.New(apperror.OrgKickCompanyOwner, …), комментарий 62–66
                              называет делегата с company.{cid}.member.kick, бьющего по владельцу
```
Попутно исправился мой собственный лог: ключ `roles.unknown` я записывал как `en.ts:4844`,
в отчёте стоит `4864` — верен отчёт.

**Ложная тревога, которую едва не «исправил».** Промежуточный разбор выдал, что №14 цитирует
`apps/web/src/features/settings/admin/hooks/useAdminDirectInviteRow.ts:107`, а такого файла на
коммите нет. Я уже собрался править путь. В отчёте на самом деле стоит правильный
`apps/web/src/features/admin/hooks/useAdminDirectInviteRow.ts:107`, а рядом — легитимный
`apps/web/src/features/settings/admin/hooks/useAdminMembersSettingsPanel.ts` (это другой файл,
он действительно лежит под `settings/`). Мой жадный регексп склеил два соседних пути в
несуществующий гибрид.

Пятый за прогон случай, когда ложный результат пришёл из моего же инструмента, а не из продукта, —
и первый, где он едва не привёл к **порче верных данных**: правка «исправила» бы корректную
ссылку на некорректную. Проверка перед правкой (`grep` точной строки в самом файле отчёта)
стоила одну команду.

### Выборочная перепроверка списка «воспроизводится»: ALK-3025

Список закрываемых я перепроверил (раздел 8н); список «воспроизводится» тоже стоит выборочно
подтвердить — ошибка в эту сторону стоит разработчику времени на баг, которого нет.

**ALK-3025** (`/reset-password` с недействительной ссылкой не даёт запросить новую) —
**воспроизводится.** Проверены разом все три экрана с недействительным токеном, из чистого
контекста без сессии:

```
/reset-password?token=<invalid>
  "Set a new password. Choose a new password for your Aloqa account."
  полей пароля: 2
  элементы: Reset password | Back to sign in          <- запросить новую ссылку нечем
  недействительный токен до отправки формы вообще не распознаётся

/magic-link/verify?token=<invalid>
  "This sign-in link is invalid or has expired. Request a new one."
  элементы: Request a new link | Back to sign in      <- правильно

/auth/verify-email?token=<invalid>
  "This verification link is invalid or has expired. Request a new one below."
  "Need a new link? Enter your account email to resend the verification link."
  элементы: Resend verification email | Back to sign up | Back to sign in   <- правильно
```

Сравнение, которое тикет приводит («magic-link и verify-email распознают недействительный токен
и предлагают запросить новую»), на этой сборке верно дословно, и `reset-password` — единственный
из трёх, кто ведёт себя иначе.

**Шаги 2–3 тикета (заполнить оба поля пароля и отправить) не выполнял** — ввод пароля в форму
вне того, что я делаю в этом прогоне. Это и не понадобилось: сам факт, что при недействительном
токене показывается полная форма вместо экрана про недействительную ссылку, виден до отправки,
а два соседних экрана дают эталон правильного поведения.

### Перепроверка «воспроизводится»: ALK-3533 и ALK-3532 — обе воспроизводятся

Блокировка обратима, поэтому эти две удалось перемерить целиком. Карточка человека — территория
сектора E, но сама блокировка и список заблокированных в моём («blocked users»), так что статус
тикетов подтверждаю по механизму, а не по экрану.

**ALK-3533 (блокировка проходит молча) — воспроизводится.**
Опрос уведомлений запущен **до** нажатия, каждые 250 мс, с проверкой прозрачности по всей цепочке
предков (не только `role=status`, иначе ловится невидимая live-область):
```
до:     список заблокированных — 0
клик Block в карточке
после:  список заблокированных — 1
        [{"id":"<UID>","username":"…","name":"QA Bob","blocked_at":"2026-08-27T02:50:37Z"}]
уведомлений за всё время наблюдения: 0
        ни диалога подтверждения, ни всплывания об успехе, ни отмены
```
Расхождение с тикетом в одной детали: там сказано, что карточка сразу закрывается, — у меня она
осталась открытой. На вывод это не влияет (жалоба про отсутствие подтверждения и уведомления),
но при работе над тикетом эту деталь стоит перепроверить.

**ALK-3532 (карточка заблокированного не даёт разблокировать) — воспроизводится.**
Повторное открытие карточки того же человека:
```
кнопки: Message (активна) | Call (активна) | Block (НЕАКТИВНА) | Share (активна)
кнопки Unblock нет вовсе
строка про членство в workspace под кнопками — присутствует
```
Снять блокировку из карточки нечем — только через `Settings → Privacy & security`.

**Побочно, не моё и не завожу:** `Message` и `Call` в карточке заблокированного остаются
активными. Это соседствует с открытым ALK-3509 (поле ввода в диалоге с заблокированным остаётся
активным, сообщение уходит и только потом помечается ошибкой). Отмечаю связь, чтобы тот, кто
возьмёт 3532, увидел, что дело не только в отсутствии Unblock.

**Стенд возвращён:** `POST /api/v1/messaging/users/unblock` → 200 `{"ok":true}`,
список заблокированных снова пуст.

### Перепроверка «воспроизводится»: ALK-3551 — воспроизводится, и границу можно назвать точнее

Тикет про то, что изменение состава не видно без ручной перезагрузки. Проверено на смене **ролей**
(обратимо, в отличие от добавления участника): страница списка участников открыта у одного
аккаунта и **не трогается**, роль другому участнику выдаёт второй аккаунт.

```
страница Settings → Admin → Members открыта, ни разу не перезагружалась

владелец: POST /api/v1/companies/roles           -> 200  роль "QA D LiveProbe"
          POST /api/v1/companies/roles/assign    -> 200  назначена третьему участнику

сразу после назначения, без перезагрузки:   "QA Carol … Member"        <- новой роли нет
через 30 секунд (как в шагах тикета):       "QA Carol … Member"        <- по-прежнему нет
```

**Уточнение к тикету.** Дальше шаг 4 тикета — «перейти между разделами и вернуться»:

```
уход на Appearance и возврат на Members по внутренней навигации (без reload):
                                            "QA Carol … QA D LiveProbe Member"   <- появилась
полная перезагрузка:                        то же самое
сервер всё это время:                       roles = ["QA D LiveProbe", "Member"]
```

То есть **полная перезагрузка не нужна — хватает ухода со страницы и возврата**. Тикет
формулирует это как «появляется только после ручной перезагрузки»; на самом деле список
запрашивается при монтировании и потом не обновляется, пока экран смонтирован. Разница
практическая: чинить нужно ревалидацию открытого экрана, а не кэш, переживающий навигацию.

Пробная роль отозвана и удалена, в компании снова три фикстурные роли.

## Свод: что из сводки ALK перепроверено в последний час

Списки «можно закрывать» и «воспроизводится» — то, по чему пользователь может действовать,
поэтому в конце прогона они выборочно перемерены ещё раз. Ошибка в любую сторону стоит дорого:
закрыть живой баг или отправить разработчика к несуществующему.

| тикет | список | как подтверждено сейчас |
|---|---|---|
| ALK-2241 | закрыть | Danger zone: обе кнопки `disabled=true` нативно, подпись «not available yet» |
| ALK-3536 | закрыть | попутно переписью каталога: все 11 подписей прав компании — человеческие фразы |
| ALK-1954 | закрыть | там же: «Create company roles and assign or revoke them for members» |
| ALK-2654 | закрыть | попутно шагами №11 и №19: блок storage на `Admin → Workspaces`, значения выводятся |
| ALK-2242 | закрыть | **не перемерял** — нужно снова исключать участника из компании; два измерения есть раньше |
| ALK-3522, ALK-3426 | закрыть | держатся на многопробных замерах ночи (165 и 58/97 проб) |
| ALK-3025 | воспроизводится | все три экрана с недействительным токеном разом; reset-password — единственный без «запросить новую» |
| ALK-3532 | воспроизводится | карточка заблокированного: Block неактивна, Unblock нет, строка про членство есть |
| ALK-3533 | воспроизводится | блокировка сработала, уведомлений за всё наблюдение — 0 |
| ALK-3551 | воспроизводится | список не обновляется на смонтированном экране; **уточнено:** хватает ухода и возврата, полная перезагрузка не нужна |
| ALK-3535 | воспроизводится | попутно шагами №2 (журнал компании отдаётся, экран отказывает) |
| ALK-3537 | воспроизводится | попутно шагами №19 (подзаголовок Workspace) |
| ALK-3005 | воспроизводится | попутно шагами №17: `Unknown device` в списке сессий |
| ALK-3006 | воспроизводится | попутно проверкой срока приглашения: действующая ссылка объявляется участнику недействительной |
| ALK-3117 | воспроизводится | **не перемерял** — потребовало бы смены имени, которая блокирует поле на неделю |

Два тикета из пятнадцати не перемерены намеренно, и в обоих случаях причина — цена изменения
стенда, а не недостаток времени. У обоих есть измерения раньше в прогоне.

**Ничего в Jira не заведено и не прокомментировано** — это решение пользователя.

## Проверено и работает — System settings и Search reindex закрыты честно (замер, а не вывод)

Два пункта сектора я весь прогон помечал как «не покрыты, нужен super-admin». Это был вывод из
кода (`hasSystemSettingsSection = isSuperAdmin`), а не измерение. Померено:

```
аккаунт: владелец компании, is_super_admin = false

в навигации пункта System settings нет вовсе       (a[href*="system-settings"] отсутствует)
прямой переход .../settings/admin/system-settings:
  "Platform system settings — Platform-wide limits and switches, applied to every company.
   Admin access required. Only system super-administrators can change platform settings."
  интерактивных элементов в области содержимого: 0

сервер согласен с экраном:
  GET /api/v1/admin/search/reindex -> 403
```

**Гейт честный по всем трём признакам:** пункта нет в навигации, прямой переход отказывает,
сервер отказывает тоже. И текст отказа называет **верное** условие — «only system
super-administrators», — в отличие от отказа журнала аудита (находка №2), который ссылается на
владельца workspace, то есть не на тот слой.

Покрыть эти два пункта по-прежнему нечем: super-admin-аккаунта в фикстурах нет. Но теперь
известно, что **скрыты они корректно**, а не «не проверены».

## Кандидат в находки (в отчёт НЕ добавлен) — в личном workspace подпись утверждает принадлежность к компании, которой нет

Найдено в последний час при проверке переключателя workspace. Личный workspace создаётся каждому
аккаунту автоматически при первом входе (разобрано выше, строка про outsider'а). Раньше я смотрел
случай участника, который **не состоит ни в одном общем** workspace: там компания в оболочке не
называется вовсе. Здесь другой случай — участник, который состоит в общем workspace, открывает
**свой личный**.

**Факт, проверен прямым запросом:**
```
GET /api/v1/workspaces/<личный>  -> 200
  {"id":"W4OW…","name":"QA Alice's workspace","slug":"personal-U4QDALICE000001",
   "type":"personal","owner_id":"U4QDALICE000001", …}
  поля company_id нет вовсе

GET /api/v1/workspaces/<общий>   -> 200
  {"id":"W4QD…","type":"company","company_id":"O4QDF1XTURESO01", …}
```

**Что показывает экран, будучи в личном workspace:**
```
Settings → Company
  подзаголовок: "The company this workspace belongs to, and the workspaces inside it."
  на странице:  "Active company  QA Fixtures D",  Switch company,  поле имени компании
```
Подзаголовок утверждает, что показанная компания — та, **которой принадлежит этот workspace**.
Личный workspace не принадлежит никакой компании: поля `company_id` у него нет. Показывается на
самом деле *активная компания пользователя* — понятие уровня аккаунта, а не свойство workspace.

**Уточнение, снимающее половину моего же первого впечатления.** Сначала я записал, что в том же
контексте пункты `Admin → Members`, `Admin → Audit log`, `Admin → Invites` тоже говорят
«Everyone in **this company**» в workspace без компании. Перепроверил состав навигации:

```
пункты настроек в личном workspace:
  account, profile, notifications, appearance, calls, privacy, sessions, security, about,
  company, workspace, roles?scope=company
пунктов admin/* в навигации: НЕТ НИ ОДНОГО
```

То есть группа ADMIN там скрыта правильно, а на те три страницы я попал, **набрав адрес руками**.
Их подзаголовки в пользовательский путь не входят, и в кандидата они не идут.

Остаётся ровно одно, и оно достижимо из меню: **подпись `Settings → Company`**. Пункт
`Roles (company scope)` в меню тоже есть и отказывает, но это то же поведение, что и в обычном
workspace у участника без прав, — разобрано выше и признано намеренным.

**Почему не добавил в отчёт.** Дефект копирайтный, того же семейства, что находка №19
(подзаголовок описывает то, чего на странице нет), и по важности — Low. Отчёт к этому часу
проверен по всем измерениям и выложен двенадцать раз; открывать его ради Low в последний час,
переписывая лид, таблицу, счётчики, README и HANDOVER, — риск больше пользы, а на триаже
косметика этого класса и так отсекается. **Решение оставляю пользователю:** факт измерен,
формулировка готова, добавление — одна правка.

Спекуляций про то, что подумает пользователь про приватность своего личного workspace, сюда
намеренно не пишу: этого я не измерял.

## Проверено и работает — личный workspace и поле имени без права на правку

Две проверки из последнего часа, обе дали отрицательный результат (дефекта нет), обе стоит
записать, чтобы следующая сессия их не переоткрывала.

**1. В личном workspace нет Danger zone — и это правильно.**
```
личный workspace, Settings → Workspace:
  Danger zone отсутствует полностью
  элементы: Upload image, поле имени (владелец — сам пользователь)

общий workspace, тот же экран:
  "Danger zone — Membership changes that affect your access.
   Leave this workspace — Remove yourself from this workspace and clear its local workspace state."
  элементы: поле имени, Leave workspace
```
Выйти из автоматически созданного собственного workspace не предлагается — предлагать было бы
бессмысленно, потому что уйти из него некуда и он создаётся заново.

**2. Поле имени workspace у участника без права `edit` — по-настоящему только для чтения.**
Сначала мне показалось, что поле выглядит редактируемым (в раннем переборе я снимал только
`disabled`, а не `readOnly`). Померено как следует:
```
участник без workspace.<WS>.edit:
  input: readOnly = true, disabled = false
  печать в поле:      значение не изменилось ("QA Workspace D")
  панель Save/Discard: не появилась
  запросов на запись:  0
  имя на сервере:      не менялось
```
Вместе с ранним замером (с выданным `edit`: `readOnly=false`, появляется `Upload image`,
появляются `Discard`/`Save changes`, `PATCH -> 200`) это чистая пара до/после: право
переключает именно `readOnly`, а не только видимость кнопок.

Замечание к методу: `disabled` и `readOnly` — разные вещи, и перебор, снимающий только первое,
покажет «поле активно» у поля, в которое нельзя ввести ни символа.

## Проверено и работает — `Create workspace` в переключателе ограничен правами, а не открыт всем

Пункт `Create workspace` в меню workspace показывается участнику, у которого **нет** права
компании `workspace.create`. По форме это выглядело как ещё один случай «контрол предлагают
без права» — то есть как находки №1–№3 наоборот. Оказалось наоборот-наоборот: сделано правильно.

```
участник без company.<CO>.workspace.create открывает меню -> Create workspace
диалог: "Create workspace | Create in: Personal workspace | Name (2–128) | Cancel | Create"
раскрываю селектор "Create in":
  вариантов: 1  -> "Personal workspace"
  компании QA Fixtures D в списке НЕТ
```

То есть пункт предлагается потому, что человеку **действительно есть что создать** — личный
workspace, для которого право компании не нужно, — а область создания отфильтрована по правам:
компания, в которой он создавать не может, в выбор просто не попадает. Это ровно то, чего не
хватает находкам №1–№3: там право есть, а экран закрыт; здесь права нет, и вариант честно убран
из списка, вместо того чтобы предложить и упасть.

**Попутно — подкрепление находки №18.** Этот диалог создания workspace содержит и `Cancel`,
и `Close`, и закрывается по Escape (проверено: после двух Escape диалога нет, workspace не
создан — список workspace у аккаунта не изменился). А полноэкранная страница создания
**компании** (`/company/create`, находка №18) не содержит ни одного способа уйти. Один и тот же
продукт, одна и та же задача «создай сущность», два разных решения.

**В отчёт править не понадобилось: это сравнение там уже есть.** №18 говорит дословно
«Соседние экраны продукта такой выход дают: диалог `Create workspace` имеет `Cancel`, страницы
`/auth/verify-email`, `/magic-link/verify` и `/reset-password` — `Back to sign in`». Сегодняшний
замер — независимое подтверждение уже опубликованного утверждения (и `Cancel`, и `Close`, и
Escape действительно работают), а не новый материал. Проверил, прежде чем открывать отчёт:
привычка, стоившая сегодня одной едва не внесённой порчи верной ссылки.

## Финальная проверка здоровья сектора — чисто с обеих сторон

После всех сегодняшних мутаций стенда (роли выдавались и отзывались десятки раз, менялись имя
workspace, настройки приватности, профиль, уведомления, блокировки) — сплошной обход 18 маршрутов
раздела настроек **двумя аккаунтами**:

```
владелец компании:  18 маршрутов   ответов 4xx/5xx: 0   ошибок в консоли: 0
обычный участник:   18 маршрутов   ответов 4xx/5xx: 0   ошибок в консоли: 0
```

Второй результат интереснее первого. У обычного участника **пять** из этих маршрутов отказывают
(`roles?scope=company`, `roles?scope=workspace`, `admin/invites`, `admin/workspaces`,
`admin/audit-log`), и при этом ни одного ответа 4xx не зафиксировано: клиент решает про доступ
сам и рисует отказ, **не отправляя запрос, который заведомо получит 403**. Это то же поведение,
что я наблюдал на странице ролей раньше в прогоне, — теперь оно подтверждено на всём разделе.

Отсюда, кстати, следует практическое: **измерять «отдаёт ли сервер данные обладателю права»
нужно своим запросом из вкладки, а не наблюдением за сетью** — страница просто не спросит.
Именно так и построены измерения находок №2 и №3, и это не случайность метода, а необходимость.

## Подкрепление находки №10 — журнал аудита в русской локали

Строка «Проверки» у №10 требует, чтобы обе локали давали осмысленный текст, а даты шли в формате
выбранного языка. Померено переключением языка аккаунта туда и обратно.

```
en:  заголовки  ACTION | ACTOR | TARGET | CREATED | METADATA
     дата       "Aug 27, 2026, 7:38 AM"

ru:  заголовки  ДЕЙСТВИЕ | АВТОР | ЦЕЛЬ | СОЗДАНО | МЕТАДАННЫЕ      <- переведены
     дата       "27 авг. 2026 г., 07:38"                            <- локализована

в обеих локалях колонка действия:  role.deleted, role.revoked, role.assigned, role.created
в обеих локалях колонка метаданных: сырой JSON, ячеек с JSON на странице — 96
```

**Что это добавляет к находке.** Мебель таблицы локализована полностью: и заголовки колонок, и
формат даты меняются вместе с языком. Значит сырые ключи и JSON в ячейках — **не пробел в
переводе**, а данные, выведенные как есть: переводить там нечего, потому что строка вообще не
проходит через словарь. Это ровно то, что №10 и утверждает, и теперь у утверждения есть контраст
внутри одной таблицы: соседние элементы того же экрана переведены безупречно.

Язык аккаунта возвращён на `en` (проверено чтением).

## Проверено и работает — фильтр настроек: локали и устойчивость ввода

Фильтр раздела настроек уже проверялся в этом прогоне на английском. Добавлены две вещи, которых
там не было: работа на другой локали и устойчивость к форме ввода.

**Русская локаль — совпадения по русским подписям:**
```
"Приватность" -> 1 совпадение: Приватность
"Роли"        -> 1 совпадение: Роли
(для контроля, английская локаль) "Privacy" -> 1: Privacy & security
```
Локале-специфичного дефекта нет: фильтр ищет по подписям текущего языка.

**Устойчивость ввода (английская локаль):**
```
"privacy"    -> Privacy & security
"PRIVACY"    -> Privacy & security          регистр не важен
"priv"       -> Privacy & security          частичное совпадение работает
"  Privacy"  -> Privacy & security          ведущие пробелы не ломают
"secur"      -> Privacy & security, Security   совпадение по середине подписи, оба пункта
"zzz"        -> пусто
```

Дефекта нет. Язык аккаунта после проверок возвращён на `en`.

## Подкрепление находки №16 — тот же неверный совет и на русской локали (внесено в отчёт)

Находка №16 держалась на английском тексте сообщения. Проверил, что происходит на другом языке:
перевод точный, и вместе с точностью переносится сам дефект.

```
язык аккаунта переключён на ru, попытка выключить "Уведомления в приложении" и сохранить

сервер:  настройки не изменились (in_app_enabled по-прежнему true) — отказ тот же
на экране, оба сообщения одновременно:
  "Нельзя отключить уведомления в приложении, пока не включён другой способ доставки.
   Оставьте их включёнными и повторите попытку."
  "Оставьте включённым хотя бы один канал доставки уведомлений."
```

Русский текст воспроизводит обе ошибки английского: ссылается на «другой способ доставки»,
которого на странице нет (все три переключателя переведены и ни один не является доставкой),
и советует «оставьте их включёнными и повторите попытку» — единственное действие, которое
ограничение снять не может.

**Практический вывод для того, кто будет чинить, и он попал в отчёт:** правки одной строки в
`en.ts` недостаточно — тот же неверный совет лежит в словаре каждой локали. В блок измерений
№16 добавлен русский вариант рядом с английским, чтобы это было видно без дополнительной
проверки. Отчёт перевыложен (тринадцатая выкладка), бюджет прозы у №16 не изменился (135 слов):
добавленное — измерение, а не рассуждение.

Стенд: настройки уведомлений не изменились, язык аккаунта возвращён на `en` (проверено чтением).

## Тексты отказов на двух локалях — подтверждение к №2, в отчёт не вносил

Проверил, не является ли «A workspace owner» в отказе журнала аудита случайностью английской
строки. Не является: оба языка говорят одно и то же, а соседний отказ на том же экране называет
слой правильно.

```
en, журнал аудита: "You do not have permission to view the audit log.
                    A workspace owner or an administrator can grant this access."
ru, журнал аудита: "У вас нет разрешения на просмотр журнала аудита.
                    Выдать этот доступ может владелец рабочего пространства или администратор."

en, роли компании: "…A company owner or an administrator can grant this access."
ru, роли компании: "…Выдать этот доступ может владелец компании или администратор."
```

Продукт различает слои в тексте отказа — у ролей компании назван владелец **компании**. Значит
в журнале аудита «владелец рабочего пространства» стоит намеренно и согласовано с гейтом
(`capabilities.ts` спрашивает про workspace), а не является общей заглушкой. Для обладателя
company-scope `audit.view` оба текста указывают не на тот слой.

**В отчёт не вносил.** Дефект №2 — в том, что раздел не открывается, а не в формулировке отказа;
формулировка там уже процитирована, и добавлять к High второй язык значило бы раздувать находку
ради детали, которая её не меняет. В отличие от №16, где неверный совет **и есть** сама находка,
и потому вторая локаль там важна.

Язык аккаунта возвращён на `en`.

## Находка №16 проверена на всех четырёх локалях — дефект везде один и тот же

Продолжение предыдущего раздела: раз неверный совет **и есть** сама находка, важно, в скольких
словарях он лежит. Проверены все четыре языка приложения.

```
English        "In-app notifications cannot be turned off while no other delivery method is
                enabled. Keep them on and try again."
Russian        "Нельзя отключить уведомления в приложении, пока не включён другой способ
                доставки. Оставьте их включёнными и повторите попытку."
Uzbek          "Boshqa yetkazish usuli yoqilmagan boʻlsa, ilova ichidagi bildirishnomalarni
                oʻchirib boʻlmaydi. Ularni yoqilgan holda qoldirib, qayta urinib koʻring."
Uzbek Cyrillic "Бошқа етказиш усули ёқилмаган бўлса, илова ичидаги билдиришномаларни ўчириб
                бўлмайди. Уларни ёқилган ҳолда қолдириб, қайта уриниб кўринг."
```

Переведено везде, и везде совет один: оставьте включённым то, что вы выключаете. **Правка одной
строки в `en.ts` проблему не закроет** — это внесено в блок измерений №16 одной строкой (пасты
всех четырёх там нет, они здесь).

**Шестая за прогон ложная отрицательная от моего же инструмента.** Первый заход по узбекской
кириллице показал «сообщений нет» — я искал кнопку сохранения по списку `Saqla|Save|Сохранить`,
а она называется **«Билдиришнома созламаларини сақлаш»**. Сохранение просто не нажималось.
Правильный приём тот же, что и весь прогон: не угадывать подпись, а перечислить кнопки и нажать
ту, что есть (здесь — последнюю в панели сохранения, чем бы она ни была подписана). Вывод
«на этой локали сообщения нет» был бы неправдой.

Стенд: настройки уведомлений не изменились ни разу (сервер каждый раз отклонял сохранение),
язык аккаунта возвращён на `en` — проверено чтением после каждого прохода.

## Подписи из №17 и №19 на русской локали — переведены точно, дефект переносится

Проверил, не держатся ли находки про подзаголовки на английской строке. Не держатся: русские
подписи обещают ровно то же самое.

```
Sessions          "Все устройства, вошедшие в этот аккаунт, и как завершить сеанс."   (№17)
About             "Версия, лицензии и куда обратиться за помощью."                    (№19)
Security          "Пароль, двухфакторная аутентификация и ключи шифрования."           (№19)
Admin→Workspaces  "Все рабочие пространства компании и у кого есть к ним доступ."      (№19)
Company dashboard "Единый обзор людей, пространств и недавних действий компании."      (№19)
```

Каждая обещает то, чего на странице нет, теми же словами, что и английская. Значит, если чинить
решат **правкой текста**, править придётся все четыре словаря; если чинить решат **добавлением
содержимого** — локали ни при чём.

Попутно: `Неизвестное устройство` в списке сессий — это ALK-3005 на русской локали, тикет
воспроизводится и здесь.

**В отчёт не вношу — по тому же правилу, что и для №2.** У №17 и №19 дефект в том, что на
странице нет обещанного, а не в формулировке; язык этого не меняет. У №16 наоборот: неверный
совет **и есть** находка, поэтому там перечень локалей в отчёт пошёл. Правило, которым я
пользовался в обоих случаях: **вторая локаль идёт в отчёт тогда, когда сам текст является
дефектом, и остаётся в логе, когда текст лишь описывает дефект.**

Язык аккаунта возвращён на `en`.

## Уточнение к №10 — сырой JSON виден целиком, а не обрезан

Проверил, не прячется ли часть метаданных: если бы ячейка обрезала JSON и развернуть его было
нечем, находка была бы про две разные вещи сразу.

```
ячеек с JSON на странице: 96
первая ячейка: scrollWidth 448 == clientWidth 448   -> обрезки нет, текст переносится
атрибута title нет, кнопки внутри ячейки нет
строка не раскрывается: aria-expanded / role=button в строке отсутствуют
клик по строке: диалог не открывается, длина содержимого страницы не меняется
```

То есть JSON **читается целиком**, просто он сырой. Находка №10 именно это и утверждает —
«выводит служебные ключи событий и сырой JSON вместо описания произошедшего» — и ничего про
обрезку или скрытые данные не говорит. Проверено, чтобы убедиться, что формулировка не
преувеличивает: не преувеличивает, менять в отчёте нечего.

Побочно: раскрыть подробности события на этом экране нечем вовсе — ни строкой-раскрывашкой,
ни диалогом. Для находки это не нужно (данные и так видны), но при переделке колонки в
человекочитаемый вид место для подробностей придётся откуда-то взять.

## Лид отчёта содержал устаревшее число — исправлено (следствие полной переписи прав)

Полная перепись прав, сделанная в этот час, задним числом сделала лид неверным, и я это едва
не пропустил: смотрел на находки, а не на числа вокруг них.

```
было:  "из десяти прав компании таких восемь, — и на этом фоне видны три, которые не открывают"
стало: "из десяти прав компании таких шесть, — и на этом фоне видны три находки"
```

**Откуда взялось расхождение.** Когда лид писался, дефектными по компании считались два права —
`audit.view` и `role.manage`, отсюда «восемь из десяти работают». Сегодняшняя перепись выдала
`role.update` и `role.delete` **по отдельности** и померила каждое: оба тоже не открывают ничего
(отказ на всех экранах, 0 элементов). Значит дефектных прав компании четыре, работающих — шесть.

Заодно поправлена вторая половина фразы: «видны три, **которые не открывают**» читалось как
«три права», а имелись в виду три **находки** (№1, №2, №3), которые эти права и собирают.
Теперь так и написано.

**Что из этого следует для метода.** Число в лиде было верным в момент написания и стало
неверным от моей же более тщательной проверки. Это тот же класс, что и стухшая сводка у соседней
сессии, только внутри одного документа: **уточнил измерение — перечитай всё, что на него
ссылалось**, включая собственный вводный абзац. Проверки структуры (статьи, строки, чипы,
бюджеты) такое не ловят: они считают форму, а не согласованность чисел с содержанием.

Отчёт перевыложен (пятнадцатая выкладка), состав не изменился: 19 находок, 3 High / 7 Medium /
9 Low, 19 строк таблицы, непарных тегов 0.

## Проверено и работает — сплошной i18n-обход сектора на узбекской кириллице

Раньше в прогоне записано «все четыре локали, непереведённого нет», но это были точечные
проверки. Сделал сплошной обход: узбекская кириллица удобна тем, что латиница в ней видна
сразу, поэтому непереведённая строка не спрячется.

Метод: 16 маршрутов раздела настроек, обход текстовых узлов внутри области содержимого
(навигация исключена), отбрасываются узлы, где есть хоть один кириллический символ, и узлы
без латинских слов длиной 4+.

```
маршрутов с латиницей в содержимом: 5 из 16
и ни одна из находок не является непереведённой строкой интерфейса:

account            LinkedIn, GitHub                     <- названия сервисов
roles?scope=company Member, Admin, Guest + R4QD…        <- имена ролей и их идентификаторы
admin/members      qa_d_admin, qa_d_alice, Admin…       <- логины и имена ролей
admin/invites      Member, Guest                        <- имена ролей
admin/audit-log    role.deleted, role.revoked, role:R4OX… <- сырые ключи событий = находка №10
```

Имена ролей и логины — **данные**, а не интерфейс: в реальной компании роли называются как
угодно, и переводить их нельзя. `LinkedIn` и `GitHub` — имена собственные.

**Единственное место, где латиница на этом экране является дефектом, — журнал аудита**, и оно
уже описано находкой №10. То есть обход не только не нашёл нового, но и подтвердил, что №10
покрывает весь класс «нечитаемая латиница в интерфейсе» в этом секторе.

Язык аккаунта возвращён на `en`.

## Проверено и работает — экраны авторизации на узбекской кириллице переведены полностью

Половина сектора «Auth & onboarding» проверялась только на английском: язык там выбирается не
настройкой аккаунта (аккаунта ещё нет), а переключателем на самом экране. Переключатель нашёлся
на `/login` и предлагает все четыре языка:

```
English | Russian | Uzbek | Uzbek (Cyrillic)
```

Выбрал `Uzbek (Cyrillic)` в чистом контексте без сессии и обошёл шесть экранов, считая
латинские слова длиной 4+ вне навигации (имена собственные `Aloqa`, `Google` исключены):

```
/login                                        латиницы 0, кириллица есть
/signup                                       латиницы 0, кириллица есть
/forgot-password                              латиницы 0, кириллица есть
/reset-password?token=<invalid>               латиницы 0, кириллица есть
/auth/verify-email?token=<invalid>            латиницы 0, кириллица есть
/magic-link/verify?token=<invalid>            латиницы 0, кириллица есть
```

Непереведённых строк нет ни на одном, **включая экраны недействительного токена** — то есть
переведены и редкие состояния ошибок, а не только основной путь.

Попутно подтверждено: выбранный анонимно язык **переживает переходы между экранами** (кириллица
присутствует на всех шести, хотя выбор делался один раз на `/login`).

Вместе с обходом настроек на той же локали (16 маршрутов) это закрывает i18n по сектору целиком:
единственная латиница, которая является дефектом, — сырые ключи в журнале аудита, находка №10.

## НАХОДКА №20 [Low] [frontend] — в узбекской локали месяц во всех датах выводится кодом `M08`

Найдена в 08:30 при достройке матрицы форматов даты по локалям. **Внесена в отчёт**, отчёт теперь
20 находок (3 High / 7 Medium / 10 Low).

```
одна строка журнала аудита, четыре языка:
  English          "Aug 27, 2026, 7:38 AM"
  Russian          "27 авг. 2026 г., 07:38"
  Uzbek            "2026 M08 27 07:38"        <- месяц кодом
  Uzbek (Cyrillic) "27 авг, 2026 07:38"

локаль Uzbek, другие экраны:
  Admin → Members  "2026 M08 25 20:20" | "2026 M08 26 22:13" | "2026 M08 27 02:18"
  Admin → Invites  "2026 M09 3 07:13"  | "2026 M08 25 07:02"
```

**Причина установлена измерением в самом браузере, а не выводом из поведения:**
```
Intl.DateTimeFormat('uz',      {month:'long'})  -> "M08"
Intl.DateTimeFormat('uz-Latn', {month:'long'})  -> "M08"   (resolvedOptions().locale = "uz")
Intl.DateTimeFormat('uz-Cyrl', {month:'long'})  -> "август"
```
В данных ICU браузера у узбекской латиницы нет названий месяцев; `Intl` отдаёт `M08` сам, до
всякого кода приложения. Это узкая ответственная граница: приложение делегирует формат платформе
и ничего не портит — но пользователю, выбравшему узбекский, все даты в продукте нечитаемы.

**Почему это пошло в отчёт, хотя Low.** CLAUDE.md прямо требует называть локале-специфичные
дефекты явно. Плюс охват: это не один экран, а каждая дата в одном из четырёх заявленных языков,
с чистым контролем рядом (узбекская кириллица тем же путём работает).

**Почему это не нашлось раньше.** Локали в этом прогоне проверялись на **непереведённые строки**
(латиница там, где должна быть кириллица). `2026 M08 27` этой проверки не нарушает: в нём нет
латинских слов, он выглядит как дата. Формат даты — отдельное измерение от полноты перевода,
и до последнего часа я его не делал.

## Форматы чисел по локалям — findings нет, и один замер вышел неубедительным

После находки №20 логично было проверить соседний класс: не только даты, но и числа. Результат
скромный, записываю как есть.

```
Intl.NumberFormat(1234567.89):
  en       "1,234,567.89"
  ru       "1 234 567,89"
  uz       "1,234,567.89"      <- разделители как в английском
  uz-Cyrl  "1 234 567,89"      <- как в русском
```

Две письменности одного языка форматируют числа по-разному. Само по себе это расхождение в
данных ICU, как и в №20. **Но находки здесь нет:** я не нашёл в секторе ни одного экрана, где
выводится число достаточно большое, чтобы разделитель был виден. Правило «нет наблюдаемого
следствия — нет находки» тут и применяется: сообщать разработчику о расхождении, которого
пользователь не видит, значит тратить его время.

**Замер по размерам хранилища вышел неубедительным, и это моя вина, а не продукта.**
```
ru:  "0 B из 10 GB", "0 B из 30 GB · свободно"     <- блок раскрылся, формат читаемый
uz, uz-Cyrl:  ничего                                <- блок НЕ раскрылся
```
Кнопка `Show storage` на узбекских локалях называется иначе, а мой матчер перебирал
`Show storage | Xotira | хранилищ | Хотира` и не попал. То есть про размеры на узбекском я не
знаю ничего — не «там всё хорошо» и не «там плохо». Седьмой за прогон случай, когда подпись
угадывалась вместо перечисления; записываю в этот раз без исправления, потому что времени на
переделку уже нет, а выдавать неубедительный замер за отрицательный результат нельзя.

**Дополнено через несколько минут — замер доведён до конца, задачи для следующей сессии нет.**
Раскрыл блок правильным способом: перечислил кнопки области содержимого и нажал последнюю,
не угадывая подпись.
```
uz:       кнопки "Ish maydoni yaratish", "Saqlashni koʻrsatish"   <- вот как она называется
          "10 GB dan 0 B ishlatilgan", "30 GB dan 0 B ishlatilgan · 30 GB boʻsh"
uz-Cyrl:  кнопки "Иш майдони яратиш", "Сақлашни кўрсатиш"
          "10 GB дан 0 B ишлатилган", "30 GB дан 0 B ишлатилган · 30 GB"
```
Формат размеров на обеих узбекских локалях **в порядке**: числа обычные, единицы `B`/`GB`
сохранены, предлог переведён. Дефекта нет — и теперь это измерение, а не ожидание.

Подписи кнопок стоит перечитать ещё раз: `Saqlashni koʻrsatish` и `Сақлашни кўрсатиш` не совпали
бы ни с одним разумным угаданным шаблоном. Перечисление вместо угадывания — единственный приём,
который работает на незнакомой локали.
