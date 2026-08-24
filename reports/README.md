# Published reports

| file | artifact URL | session |
|---|---|---|
| `aloqa-calls-qa-2026-08-23.html` | https://claude.ai/code/artifact/a85a9d05-a32e-4642-b008-bcdc27628d79 | 2026-08-23, звонки |
| `aloqa-calls-qa-2026-08-24.html` | https://claude.ai/code/artifact/a1947630-1096-487f-bf01-d7863b819a12 | 2026-08-24, звонки (глубокий проход) |

Чтобы обновить отчёт из другой сессии, передайте URL как `url` в Artifact —
публикация без `url` создаст отдельный артефакт.

## Заготовки тикетов

`alk-tickets-2026-08-23.md` — 16 дефектов по звонкам, по одному блоку на тикет,
в стиле summary проекта ALK (`[FE-WEB][CALLS] …`). Формулировки обезличены:
без тестовых аккаунтов, идентификаторов встреч и деталей стенда — можно отдавать
разработчикам как есть.

## Заведено в Jira (24.08.2026)

Все 7 дефектов созданы в проекте **ALK**, тип **Bug**, статус Backlog. Лейбл — по области.

| # | Jira | Лейбл | Дефект |
|---|---|---|---|
| 1 | [ALK-3368](https://ttbrm.atlassian.net/browse/ALK-3368) | backend | Пароль звонка перебирается без ограничений |
| 2 | [ALK-3369](https://ttbrm.atlassian.net/browse/ALK-3369) | frontend | Ползунок Maximum video quality недоступен с клавиатуры |
| 3 | [ALK-3371](https://ttbrm.atlassian.net/browse/ALK-3371) | frontend | Вместо причины ошибки — «Try again» |
| 4 | [ALK-3372](https://ttbrm.atlassian.net/browse/ALK-3372) | frontend | Длинное название — звонок молча не создаётся |
| 5 | [ALK-3373](https://ttbrm.atlassian.net/browse/ALK-3373) | frontend | Второе устройство — «Call ended», хотя звонок идёт |
| 6 | [ALK-3374](https://ttbrm.atlassian.net/browse/ALK-3374) | frontend | Push to talk — микрофон не работает, причина не объяснена |
| 7 | [ALK-3375](https://ttbrm.atlassian.net/browse/ALK-3375) | frontend | Live now: неверное число участников в личном звонке |

Итог: 1 backend + 6 frontend. (ALK-3370 — не наш, создан параллельно кем-то ещё.)
