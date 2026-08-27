/* B — «Журнал звонка пишет "Meeting ended for everyone", хотя звонок никто не завершал».
 * Скрипт делает шаги 1-3 находки и открывает страницу завершённого звонка;
 * вкладку Logs открывает человек.
 *   ./d b:carol snip/b-endlog.mjs        (окно ведущего — alice — поднимается само)
 *
 * Драйвер — carol: она выходит из звонка последней, поэтому именно её окно остаётся
 * на странице завершённого звонка, и судить человек будет по нему.
 */
import { second } from './b-second.mjs';

const WS = 'W4QBF1XTURESO01';
const HOST = 'https://staging.airion-cargo.store';
const MINE = /^QA [a-z]+ \d{6}$/;

/** Настоящий выход из звонка: Leave call + подтверждение Leave, потом проверка адреса.
 *  Эти кнопки игнорируют программный element.click() — нужен реальный клик мышью. */
async function leaveCall(p) {
  const box = await p.evaluate(() => {
    const b = [...document.querySelectorAll('button[aria-label="Leave call"],[data-testid="call-controls-leave"]')]
      .filter(x => x.getBoundingClientRect().width > 0)[0];
    if (!b) return null;
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  if (!box) return { left: false, why: 'кнопки Leave call нет' };
  await p.mouse.click(box.x, box.y);
  await p.waitForTimeout(2200);
  const cbox = await p.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog],[role=alertdialog]')]
      .filter(x => x.getBoundingClientRect().width > 0 && x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    if (!d) return null;
    const b = [...d.querySelectorAll('button')].find(x => /^Leave$/i.test((x.innerText || '').trim()));
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  if (!cbox) return { left: false, why: 'диалог подтверждения не открылся' };
  await p.mouse.click(cbox.x, cbox.y);
  await p.waitForTimeout(7000);
  return { left: !/\/call\//.test(p.url()), url: p.url() };
}

async function endOwnLeftover(p) {
  return await p.evaluate(async mine => {
    const j = await (await fetch('/api/v1/meetings/current', { credentials: 'include' })).json().catch(() => null);
    const m = j && j.meeting;
    if (!m || m.status !== 'active') return { inCall: false };
    if (!new RegExp(mine).test(m.name || '')) return { inCall: true, foreign: true, name: m.name };
    const r = await fetch(`/api/v1/meeting/${m.id}/end`, { method: 'POST', credentials: 'include' });
    return { inCall: true, foreign: false, ended: m.name, status: r.status };
  }, MINE.source);
}

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const name = `QA endlog ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  out.preflight = { driver: await endOwnLeftover(page) };
  if (out.preflight.driver.foreign) {
    out.leftToDo = `Это окно уже в звонке «${out.preflight.driver.name}». Выйдите из него и запустите снippet заново.`;
    return out;
  }

  // шаг 1a — ведущий начинает групповой звонок
  const a = await second('B', 'alice');
  out.hostBrowser = { port: a.port, account: a.email, ensured: a.ensured };
  out.preflight.host = await endOwnLeftover(a.page);
  if (out.preflight.host.foreign) {
    out.leftToDo = `Окно ведущего уже в звонке «${out.preflight.host.name}». Выйдите из него и запустите снippet заново.`;
    return out;
  }
  await a.page.goto(`${HOST}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await a.page.waitForTimeout(5000);
  await a.page.evaluate(() => { const b = document.querySelector('[data-testid="calls-hub-start-now"]'); if (b) b.click(); });
  await a.page.waitForTimeout(3000);
  const ni = await a.page.$('[role=dialog] input[type=text], [role=dialog] input:not([type])');
  if (!ni) { out.leftToDo = 'Диалог Start a call у ведущего не открылся — состояние не достигнуто.'; return out; }
  await ni.fill(name);
  await a.page.evaluate(() => { const r = [...document.querySelectorAll('[role=dialog] input[type=radio]')].find(x => x.value === 'open'); if (r) r.click(); });
  await a.page.waitForTimeout(700);
  await a.page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(x => x.getBoundingClientRect().width > 0).pop();
    const b = [...d.querySelectorAll('button')].find(x => /^Start call$/i.test((x.innerText || '').trim()));
    if (b) b.click();
  });
  await a.page.waitForTimeout(9000);
  const mid = (a.page.url().match(/\/call\/([A-Za-z0-9]+)/) || [])[1] || null;
  if (!mid) { out.leftToDo = `Звонок не начался: адрес ${a.page.url()}. Состояние не достигнуто.`; return out; }

  // шаг 1b — второй участник (это окно) входит
  await page.goto(`${HOST}/w/${WS}/call/${mid}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const jb = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0)
      .find(x => /^(Join|Join call|Join now)$/i.test((x.innerText || '').trim()));
    if (!b) return null;
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  if (jb) await page.mouse.click(jb.x, jb.y);
  await page.waitForTimeout(9000);
  const twoIn = await a.page.evaluate(async id => {
    const j = await (await fetch(`/api/v1/meeting/${id}/participants`, { credentials: 'include' })).json().catch(() => null);
    const arr = (j && (j.participants || j.items || j.data)) || [];
    return arr.filter(p => !p.left_at).length;
  }, mid);
  if (twoIn < 2) { out.leftToDo = `Второй участник не вошёл в звонок (в звонке ${twoIn}) — состояние не достигнуто.`; return out; }
  progress(1); out.stepsDone = 1;

  // шаг 2 — ведущий выходит через Leave call
  const hostLeft = await leaveCall(a.page);
  if (!hostLeft.left) { out.leftToDo = `Ведущий не вышел из звонка (${hostLeft.why || hostLeft.url}) — состояние не достигнуто.`; return out; }
  await page.waitForTimeout(4000);
  progress(2); out.stepsDone = 2;

  // контроль: у оставшегося участника кнопки End for everyone нет — завершать звонок некому
  const controls = await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const b = [...document.querySelectorAll('button')].filter(vis)
      .map(x => (x.getAttribute('aria-label') || x.innerText || '').replace(/\s+/g, ' ').trim());
    return { hasEndForEveryone: b.some(t => /^End for everyone$/i.test(t)), hasLeaveCall: b.some(t => /^Leave call$/i.test(t)) };
  });

  // шаг 3 — последний участник выходит, звонок закрывается сам
  const lastLeft = await leaveCall(page);
  if (!lastLeft.left) { out.leftToDo = `Последний участник не вышел из звонка (${lastLeft.why || lastLeft.url}) — состояние не достигнуто.`; return out; }
  await page.waitForTimeout(8000);
  progress(3); out.stepsDone = 3;

  // шаг 4 (первая половина) — открыть страницу завершённого звонка
  await page.goto(`${HOST}/w/${WS}/calls/${mid}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  const probe = await page.evaluate(async id => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const m = await (await fetch(`/api/v1/meeting/${id}`, { credentials: 'include' })).json().catch(() => null);
    const meeting = m && (m.meeting || m);
    const ev = await (await fetch(`/api/v1/meeting/${id}/events?limit=100`, { credentials: 'include' })).json().catch(() => null);
    const arr = (ev && (ev.events || ev.items || ev.data)) || [];
    const ended = arr.find(e => e.event_type === 'meeting.ended');
    const tabs = [...document.querySelectorAll('button,[role=tab],a')].filter(vis)
      .map(b => (b.innerText || '').replace(/\s+/g, ' ').trim()).filter(t => /^(Recording|Chat|Logs)\b/.test(t));
    return {
      status: meeting && meeting.status, tabs,
      endedEvent: ended && {
        event_type: ended.event_type, source: ended.source,
        event: ended.payload && ended.payload.event,
        actorKeyPresent: Object.prototype.hasOwnProperty.call(ended, 'actor_user_id'),
      },
    };
  }, mid);

  out.asserted = {
    url: page.url(),
    call: name,
    nobodyPressedEndForEveryone: true,
    hostLeftFirstViaLeaveCall: true,
    lastParticipantHadNoEndForEveryoneButton: controls.hasEndForEveryone === false,
    lastParticipantControls: controls,
    meetingStatus: probe.status,
    rawEndedEvent: probe.endedEvent,
    tabsOnThePage: probe.tabs,
  };
  if (!(probe.status === 'ended' && probe.tabs.some(t => /^Logs/.test(t)) && controls.hasEndForEveryone === false)) {
    out.leftToDo = 'Не достигнуто состояние находки: нужен звонок, закрывшийся сам после выхода последнего участника, '
                 + 'и страница этого звонка с вкладкой Logs. Судить по этому экрану нельзя.';
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.leftToDo = `Открыта страница звонка «${name}». Кнопку End for everyone никто не нажимал: ведущий вышел через `
               + `Leave call первым, у оставшегося участника такой кнопки вообще не было, звонок закрылся сам. `
               + `Откройте вкладку Logs и прочитайте верхнюю строку — там написано «Meeting ended for everyone».`;
  return out;
};
