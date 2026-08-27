/* B — «На странице идущего звонка все участники показаны как пробывшие в нём 0:00».
 * Скрипт делает шаги 1-2 находки, шаг 3 (нажать View all) остаётся человеку.
 *   ./d b:carol snip/b-live-duration.mjs      (окно ведущего — alice — поднимается само)
 *
 * Страницу идущего звонка нельзя открыть в той же вкладке, что сидит в звонке:
 * маршрут /w/<ws>/calls/<id> подменяется на /w/<ws>/call/<id>. Во ВТОРОЙ вкладке того же
 * окна она открывается нормально — на неё скрипт и оставляет человека.
 */
import { second } from './b-second.mjs';

const WS = 'W4QBF1XTURESO01';
const HOST = 'https://staging.airion-cargo.store';
const MINE = '^QA [a-z]+ \\d{6}$';

async function endOwnLeftover(p) {
  return await p.evaluate(async mine => {
    const j = await (await fetch('/api/v1/meetings/current', { credentials: 'include' })).json().catch(() => null);
    const m = j && j.meeting;
    if (!m || m.status !== 'active') return { inCall: false };
    if (!new RegExp(mine).test(m.name || '')) return { inCall: true, foreign: true, name: m.name };
    const r = await fetch(`/api/v1/meeting/${m.id}/end`, { method: 'POST', credentials: 'include' });
    return { inCall: true, foreign: false, ended: m.name, status: r.status };
  }, MINE);
}

export default async ({ page, ctx, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const name = `QA dur ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

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
  const inCall = await a.page.evaluate(async id => {
    const j = await (await fetch(`/api/v1/meeting/${id}/participants`, { credentials: 'include' })).json().catch(() => null);
    const arr = (j && (j.participants || j.items || j.data)) || [];
    return arr.filter(p => !p.left_at).length;
  }, mid);
  if (inCall < 2) { out.leftToDo = `Второй участник не вошёл (в звонке ${inCall}) — состояние не достигнуто.`; return out; }
  progress(1); out.stepsDone = 1;

  // шаг 2 — «через несколько минут» открыть страницу этого звонка
  let running = 0;
  for (let i = 0; i < 90 && running < 150; i++) {
    running = await a.page.evaluate(async id => {
      const m = await (await fetch(`/api/v1/meeting/${id}`, { credentials: 'include' })).json().catch(() => null);
      const mm = m && (m.meeting || m);
      return mm && mm.started_at ? Math.round((Date.now() - Date.parse(mm.started_at)) / 1000) : 0;
    }, mid);
    if (running < 150) await page.waitForTimeout(3000);
  }
  // счётчик внутри самого звонка — из оверлея звонка, строкой после названия. Из
  // document.body сюда попадает время суток из списка встреч и читается как длительность.
  const timer = await page.evaluate(n => {
    const ov = document.querySelector('[data-testid="call-overlay-expanded"]') || document.body;
    const lines = ov.innerText.split('\n').map(s => s.trim()).filter(Boolean);
    const i = lines.findIndex(l => l === n);
    for (let k = i + 1; k >= 0 && k < Math.min(lines.length, i + 4); k++)
      if (/^\d{1,2}:[0-5]\d(:[0-5]\d)?$/.test(lines[k])) return lines[k];
    return null;
  }, name);

  const view = await ctx.newPage();
  await view.goto(`${HOST}/w/${WS}/calls/${mid}`, { waitUntil: 'domcontentloaded' });
  await view.waitForTimeout(8000);
  await view.bringToFront();
  await view.waitForTimeout(1200);
  progress(2); out.stepsDone = 2;

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  const probe = await view.evaluate(async id => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const m = await (await fetch(`/api/v1/meeting/${id}`, { credentials: 'include' })).json().catch(() => null);
    const meeting = m && (m.meeting || m);
    const j = await (await fetch(`/api/v1/meeting/${id}/participants`, { credentials: 'include' })).json().catch(() => null);
    const arr = (j && (j.participants || j.items || j.data)) || [];
    const b = [...document.querySelectorAll('button,a')].filter(vis).find(x => /^View all$/i.test((x.innerText || '').trim()));
    let topmost = false;
    if (b) {
      b.scrollIntoView({ block: 'center' });
      const r = b.getBoundingClientRect();
      const top = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
      topmost = top === b || b.contains(top);
    }
    return {
      url: location.href,
      head: (document.querySelector('main') || document.body).innerText.replace(/\s+/g, ' ').slice(0, 200),
      hasViewAll: !!b, topmost,
      status: meeting && meeting.status,
      stillIn: arr.filter(p => !p.left_at).length,
      runningSeconds: meeting && meeting.started_at ? Math.round((Date.now() - Date.parse(meeting.started_at)) / 1000) : null,
      visibility: document.visibilityState,
    };
  }, mid);

  out.asserted = {
    url: probe.url,
    call: name,
    openedInASecondTabOfTheSameWindow: true,
    thisTabIsVisible: probe.visibility,
    meetingStatus: probe.status,
    participantsStillInCall: probe.stillIn,
    callHasBeenRunningSeconds: probe.runningSeconds,
    inCallTimerOnTheCallTab: timer,
    detailPageHead: probe.head,
    viewAllButtonPresentAndTopmost: probe.hasViewAll && probe.topmost,
  };
  if (!(probe.status === 'active' && probe.stillIn >= 2 && probe.hasViewAll && probe.topmost && probe.runningSeconds >= 100)) {
    out.leftToDo = 'Не достигнуто состояние находки: нужна страница ИДУЩЕГО звонка, в котором минуты назад '
                 + 'находятся двое, и на ней кликабельная кнопка View all. Судить по этому экрану нельзя.';
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.leftToDo = `Открыта вторая вкладка со страницей идущего звонка «${name}»: звонок идёт ${probe.runningSeconds} с, `
               + `в нём двое, на соседней вкладке счётчик звонка показывает ${timer}. `
               + `Нажмите View all в блоке участников и посмотрите на длительность у каждого — `
               + `у обоих стоит «0:00 in call» при верном времени входа и пометке Current.`;
  return out;
};
