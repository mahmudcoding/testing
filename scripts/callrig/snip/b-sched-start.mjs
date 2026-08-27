/* B — «Запущенная встреча остаётся в списке запланированных с кнопкой Start call,
 *      которая ничего не делает».
 * Скрипт делает шаги 1-3 находки, шаг 4 остаётся человеку.
 *   ./d b:alice snip/b-sched-start.mjs
 */
const WS = 'W4QBF1XTURESO01';
const HUB = `https://staging.airion-cargo.store/w/${WS}/calls`;

/* Наименьший элемент, содержащий и название встречи, и кнопку с нужной подписью.
   Слишком большой контейнер держит все карточки сразу — тогда «Start call» находится
   на чужой встрече, и запускается не та. */
const CARD = `(title, label) => {
  const has = (el, t) => (el.innerText || '').includes(t);
  const btnIn = el => [...el.querySelectorAll('button')]
      .filter(b => b.getBoundingClientRect().width > 0 && new RegExp('^' + label + '$','i').test((b.innerText||'').trim()));
  const cands = [...document.querySelectorAll('div,li,article,section')]
      .filter(el => el.getBoundingClientRect().width > 0 && has(el, title) && btnIn(el).length === 1)
      .sort((a, b) => (a.innerText||'').length - (b.innerText||'').length);
  if (!cands.length) return null;
  const card = cands[0];
  return { card, btn: btnIn(card)[0] };
}`;

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const start = new Date(Date.now() + 2 * 60000);  // не в прошлом и внутри окна, где карточка предлагает Start call
  const title = `QA sched ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  // шаг 1 — Schedule meeting
  await page.goto(HUB, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  // Окно, уже сидящее в звонке, не может запустить второй: хаб не смонтирован, а повторный
  // вход зафенсен. Свою же встречу от прошлого прогона (имя «QA sched …») закрываем,
  // чужую — не трогаем и честно отказываемся.
  const pre = await page.evaluate(async () => {
    const j = await (await fetch('/api/v1/meetings/current', { credentials: 'include' })).json().catch(() => null);
    const m = j && j.meeting;
    if (!m || m.status !== 'active') return { inCall: false };
    if (!/^QA [a-z]+ \d{6}$/.test(m.name || '')) return { inCall: true, foreign: true, name: m.name };
    const r = await fetch(`/api/v1/meeting/${m.id}/end`, { method: 'POST', credentials: 'include' });
    return { inCall: true, foreign: false, endedOwnLeftover: m.name, status: r.status };
  });
  out.preflight = pre;
  if (pre.foreign) {
    out.leftToDo = `Окно уже находится в звонке «${pre.name}», запустить из него вторую встречу нельзя. `
                 + 'Выйдите из этого звонка (Leave call → Leave) и запустите снippet заново.';
    return out;
  }
  if (pre.inCall) { await page.goto(HUB, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000); }
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0)
      .find(x => (x.innerText || '').trim() === 'Schedule meeting');
    if (b) b.click();
  });
  await page.waitForTimeout(3000);
  if (!await page.$('[role=dialog] input[aria-label="Add title"]')) {
    out.leftToDo = 'Диалог Schedule meeting не открылся — состояние не достигнуто, судить по этому экрану нельзя.';
    return out;
  }
  await page.fill('[role=dialog] input[aria-label="Add title"]', title);
  await page.fill('[role=dialog] input[aria-label="Starts time"]', `${pad(start.getHours())}:${pad(start.getMinutes())}`);
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(x => x.getBoundingClientRect().width > 0).pop();
    const b = [...d.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0)
      .find(x => /^Schedule meeting$/i.test((x.innerText || '').trim()));
    if (b) b.click();
  });
  await page.waitForTimeout(5500);
  if (!await page.evaluate(t => document.body.innerText.includes(t), title)) {
    out.leftToDo = `Встреча «${title}» не появилась в хабе — состояние не достигнуто.`;
    return out;
  }
  progress(1); out.stepsDone = 1;

  // шаг 2 — Start call ровно на карточке этой встречи
  const clicked = await page.evaluate(([t, card]) => {
    const found = eval(card)(t, 'Start call');
    if (!found) return null;
    found.btn.scrollIntoView({ block: 'center' });
    found.btn.click();
    return (found.card.innerText || '').replace(/\s+/g, ' ').slice(0, 120);
  }, [title, CARD]);
  if (!clicked) {
    out.leftToDo = `На карточке «${title}» нет кнопки Start call — состояние не достигнуто.`;
    return out;
  }
  await page.waitForTimeout(9000);
  const meetingId = (page.url().match(/\/call\/([A-Za-z0-9]+)/) || [])[1] || null;
  if (!meetingId) {
    out.leftToDo = `Встреча не запустилась: ожидался маршрут /call/<id>, адрес ${page.url()}. Состояние не достигнуто.`;
    return out;
  }
  progress(2); out.stepsDone = 2;

  // шаг 3 — вернуться к списку звонков БЕЗ перезагрузки: свернуть звонок в PiP
  await page.evaluate(() => { const b = document.querySelector('[data-testid="call-surface-minimize"]'); if (b) b.click(); });
  await page.waitForTimeout(3500);

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  const probe = await page.evaluate(async ([t, card, ws, id]) => {
    const F = eval(card);
    const liveCard = F(t, 'Join');
    const schedCard = F(t, 'Start call');
    let topmost = false, at = null;
    if (schedCard) {
      schedCard.btn.scrollIntoView({ block: 'center' });
      const r = schedCard.btn.getBoundingClientRect();
      at = { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      const top = document.elementFromPoint(at.x, at.y);
      topmost = top === schedCard.btn || schedCard.btn.contains(top);
    }
    const j = await (await fetch(`/api/v1/workspace/${ws}/meetings/active`, { credentials: 'include' })).json();
    const active = (j.meetings || []).map(m => ({ id: m.id, name: m.name }));
    return {
      liveCardText: liveCard ? (liveCard.card.innerText || '').replace(/\s+/g, ' ').slice(0, 140) : null,
      schedCardText: schedCard ? (schedCard.card.innerText || '').replace(/\s+/g, ' ').slice(0, 140) : null,
      topmost, at, active, thisMeetingIsLive: active.some(m => m.id === id && m.name === t),
    };
  }, [title, CARD, WS, meetingId]);

  out.asserted = {
    url: page.url(),
    meeting: title,
    meetingIsRunningOnServer: probe.thisMeetingIsLive,
    activeMeetings: probe.active.length,
    cardInLiveNow_withJoin: probe.liveCardText,
    cardInScheduledToday_withStartCall: probe.schedCardText,
    startCallButtonIsTopmostAtItsOwnCentre: probe.topmost,
    pageWasNotReloadedAfterStart: true,
  };
  if (!(probe.thisMeetingIsLive && probe.liveCardText && probe.schedCardText && probe.topmost)) {
    out.leftToDo = 'Не достигнуто состояние находки: одна и та же встреча должна быть видна и в Live now (Join), '
                 + 'и в Scheduled today (Start call), а кнопка Start call — кликабельна. Судить по экрану нельзя.';
    return out;
  }
  progress(3); out.stepsDone = 3;

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.leftToDo = `Экран Calls, звонок свёрнут в PiP, страница после запуска НЕ перезагружалась. `
               + `Встреча «${title}» показана дважды: в Live now (кнопка Join) и в Scheduled today (кнопка Start call). `
               + `Нажмите Start call на карточке в Scheduled today: ни одного запроса к /api/v1/ она не отправляет, `
               + `новый звонок не создаётся, карточка остаётся в прежнем виде.`;
  return out;
};
