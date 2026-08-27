/* B — «Ведущий вышел из звонка с одобрением входа — впустить стучащегося больше некому,
 *      и ведущему нигде об этом не сообщают».
 * Скрипт делает шаги 1-4 находки, шаг 5 (смотреть экран ведущего) остаётся человеку.
 *   ./d b:alice snip/b-host-left-knock.mjs      (окна carol и guest поднимаются сами)
 */
import { second } from './b-second.mjs';

const WS = 'W4QBF1XTURESO01';
const HOSTURL = 'https://staging.airion-cargo.store';
const MINE = '^QA [a-z]+ \\d{6}$';

async function endOwnLeftover(p) {
  return await p.evaluate(async mine => {
    const j = await (await fetch('/api/v1/meetings/current', { credentials: 'include' })).json().catch(() => null);
    const m = j && j.meeting;
    if (!m || m.status !== 'active') return { inCall: false };
    if (!new RegExp(mine).test(m.name || '')) return { inCall: true, foreign: true, name: m.name };
    await fetch(`/api/v1/meeting/${m.id}/end`, { method: 'POST', credentials: 'include' });
    return { inCall: true, foreign: false, ended: m.name };
  }, MINE);
}

/** Реальный клик по кнопке входа/стука на экране звонка. */
async function clickJoin(p, mid) {
  await p.goto(`${HOSTURL}/w/${WS}/call/${mid}`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(6000);
  const box = await p.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const b = [...document.querySelectorAll('button')].filter(vis)
      .find(x => /^(Join|Join call|Ask to join|Join now|Request to join)$/i.test((x.innerText || '').trim()));
    if (!b) return null;
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  if (!box) return null;
  await p.mouse.click(box.x, box.y);
  await p.waitForTimeout(9000);
  // Проверку делаем ВНУТРИ страницы: срез innerText на 200 символов — это боковая панель,
  // а строка про ожидание лежит дальше, и обрезанный дамп читается как «не встал в очередь».
  return await p.evaluate(() => {
    const t = document.body.innerText.replace(/\s+/g, ' ');
    const m = t.match(/.{0,40}Waiting for host approval.{0,60}/i);
    return { waiting: !!m, excerpt: (m && m[0]) || t.slice(-160), url: location.href };
  });
}

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const name = `QA knock ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  out.preflight = { host: await endOwnLeftover(page) };
  if (out.preflight.host.foreign) {
    out.leftToDo = `Это окно уже в звонке «${out.preflight.host.name}». Выйдите из него и запустите снippet заново.`;
    return out;
  }

  // шаг 1 — звонок с режимом входа Wait for admission
  await page.goto(`${HOSTURL}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.evaluate(() => { const b = document.querySelector('[data-testid="calls-hub-start-now"]'); if (b) b.click(); });
  await page.waitForTimeout(3000);
  const ni = await page.$('[role=dialog] input[type=text], [role=dialog] input:not([type])');
  if (!ni) { out.leftToDo = 'Диалог Start a call не открылся — состояние не достигнуто.'; return out; }
  await ni.fill(name);
  await page.evaluate(() => {
    const pick = v => { const r = [...document.querySelectorAll('[role=dialog] input[type=radio]')].find(x => x.value === v); if (r) r.click(); };
    pick('public'); pick('manual_admit');
  });
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(x => x.getBoundingClientRect().width > 0).pop();
    const b = [...d.querySelectorAll('button')].find(x => /^Start call$/i.test((x.innerText || '').trim()));
    if (b) b.click();
  });
  await page.waitForTimeout(9000);
  const mid = (page.url().match(/\/call\/([A-Za-z0-9]+)/) || [])[1] || null;
  if (!mid) { out.leftToDo = `Звонок не начался: адрес ${page.url()}. Состояние не достигнуто.`; return out; }
  const flags = await page.evaluate(async id => {
    const j = await (await fetch(`/api/v1/meeting/${id}`, { credentials: 'include' })).json().catch(() => null);
    const m = j && (j.meeting || j);
    return m && { requires_approval: m.requires_approval, is_private: m.is_private };
  }, mid);
  if (!flags || flags.requires_approval !== true) {
    out.leftToDo = `Звонок создан без одобрения входа (${JSON.stringify(flags)}) — состояние не достигнуто.`;
    return out;
  }
  progress(1); out.stepsDone = 1;

  // шаг 2 — впустить одного участника, чтобы звонок пережил выход ведущего
  const c = await second('B', 'carol');
  out.secondBrowser = { port: c.port, account: c.email, ensured: c.ensured };
  await endOwnLeftover(c.page);
  const asked = await clickJoin(c.page, mid);
  if (!asked || !asked.waiting) {
    out.leftToDo = `Второй участник не встал в очередь (экран: «${asked ? asked.excerpt : 'нет кнопки входа'}») — состояние не достигнуто.`;
    return out;
  }
  await page.evaluate(() => { const b = document.querySelector('[data-testid="call-controls-people-toggle"]'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); });
  await page.waitForTimeout(2500);
  const admitted = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => /^Admit/i.test(x.getAttribute('aria-label') || ''));
    if (b) { b.click(); return b.getAttribute('aria-label'); } return null;
  });
  if (!admitted) { out.leftToDo = 'У ведущего не появилось кнопки Admit — состояние не достигнуто.'; return out; }
  await page.waitForTimeout(8000);
  const twoIn = await page.evaluate(async id => {
    const j = await (await fetch(`/api/v1/meeting/${id}/participants`, { credentials: 'include' })).json().catch(() => null);
    const arr = (j && (j.participants || j.items || j.data)) || [];
    return arr.filter(p => !p.left_at).length;
  }, mid);
  if (twoIn < 2) { out.leftToDo = `Впущенный участник не оказался в звонке (в звонке ${twoIn}) — состояние не достигнуто.`; return out; }
  progress(2); out.stepsDone = 2;

  // шаг 3 — ведущий выходит через Leave call и остаётся в рабочем пространстве
  const lbox = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button[aria-label="Leave call"],[data-testid="call-controls-leave"]')]
      .filter(x => x.getBoundingClientRect().width > 0)[0];
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  if (!lbox) { out.leftToDo = 'У ведущего нет кнопки Leave call — состояние не достигнуто.'; return out; }
  await page.mouse.click(lbox.x, lbox.y);
  await page.waitForTimeout(2200);
  const cbox = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog],[role=alertdialog]')]
      .filter(x => x.getBoundingClientRect().width > 0 && x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    if (!d) return null;
    const b = [...d.querySelectorAll('button')].find(x => /^Leave$/i.test((x.innerText || '').trim()));
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  if (!cbox) { out.leftToDo = 'Диалог подтверждения выхода не открылся — состояние не достигнуто.'; return out; }
  await page.mouse.click(cbox.x, cbox.y);
  await page.waitForTimeout(7000);
  if (/\/call\//.test(page.url())) { out.leftToDo = `Ведущий не вышел из звонка (адрес ${page.url()}). Состояние не достигнуто.`; return out; }
  await page.goto(`${HOSTURL}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const before = await page.evaluate(async () => {
    const n = await (await fetch('/api/v1/notifications?limit=50', { credentials: 'include' })).json().catch(() => null);
    const bell = [...document.querySelectorAll('button')].map(b => b.getAttribute('aria-label')).find(a => a && /Notification/i.test(a)) || null;
    return { total: n && n.total, unread: n && n.unread_count, bell };
  });
  progress(3); out.stepsDone = 3;

  // шаг 4 — третий человек открывает звонок и жмёт Join
  const g = await second('B', 'guest');
  out.thirdBrowser = { port: g.port, account: g.email, ensured: g.ensured };
  const knockedAt = Date.now();
  const knockScreen = await clickJoin(g.page, mid);
  if (!knockScreen || !knockScreen.waiting) {
    out.leftToDo = `Третий человек не встал в очередь (экран: «${knockScreen ? knockScreen.excerpt : 'нет кнопки входа'}») — состояние не достигнуто.`;
    return out;
  }
  progress(4); out.stepsDone = 4;

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  // 60 с непрерывного наблюдения за экраном ведущего, чтобы «ничего не появилось»
  // было измерением, а не одним кадром
  const samples = [];
  for (let i = 0; i < 20; i++) {
    samples.push(await page.evaluate(async ws => {
      const n = await (await fetch('/api/v1/notifications?limit=50', { credentials: 'include' })).json().catch(() => null);
      const raw = JSON.stringify(n || {});
      const act = await (await fetch(`/api/v1/workspace/${ws}/meetings/active`, { credentials: 'include' })).json().catch(() => null);
      const m = ((act && act.meetings) || [])[0] || null;
      const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      return {
        total: n && n.total, unread: n && n.unread_count,
        knockWordsInNotifications: (raw.match(/wait|pending|queue|knock|lobby|admission|request/gi) || []).length,
        bell: [...document.querySelectorAll('button')].map(b => b.getAttribute('aria-label')).find(a => a && /Notification/i.test(a)) || null,
        liveCardButtons: [...document.querySelectorAll('button')].filter(vis).map(b => (b.innerText || '').trim()).filter(t => /^(Join|Admit|Deny)$/.test(t)),
        activeMeetingKeysAboutQueue: m ? Object.keys(m).filter(k => /wait|pending|queue|knock|lobby|admission|request/i.test(k)) : null,
        toasts: [...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(vis)
          .map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 3),
        documentVisibility: document.visibilityState,
      };
    }, WS));
    await page.waitForTimeout(3000);
  }
  const key = s => JSON.stringify([s.total, s.unread, s.knockWordsInNotifications, s.bell, s.liveCardButtons, s.activeMeetingKeysAboutQueue, s.toasts]);
  const distinct = [...new Set(samples.map(key))];
  // сервер заявку держит — её видно тому же ведущему через API, просто ни один экран её не показывает
  const serverQueue = await page.evaluate(async id => {
    const r = await fetch(`/api/v1/meeting/${id}/waiting`, { credentials: 'include' });
    let b = null; try { b = await r.json(); } catch { }
    return { status: r.status, waiting: ((b && b.participants) || []).map(p => ({ name: p.name, participant_type: p.participant_type, waited_since: p.waited_since })) };
  }, mid);
  const takeover = await c.page.evaluate(async id => {
    const r = await fetch(`/api/v1/meeting/${id}/waiting`, { credentials: 'include' });
    let b = null; try { b = await r.json(); } catch { }
    const vis = el => { const r2 = el.getBoundingClientRect(); return r2.width > 0 && r2.height > 0; };
    return {
      status: r.status, key: b && b.key,
      admitDenyButtons: [...document.querySelectorAll('button')].filter(vis)
        .map(x => (x.getAttribute('aria-label') || x.innerText || '').trim()).filter(x => /admit|deny/i.test(x)).length,
    };
  }, mid);

  out.asserted = {
    url: page.url(),
    call: name,
    meetingFlags: flags,
    hostIsOutsideTheCall: !/\/call\//.test(page.url()),
    someoneIsKnockingRightNow: serverQueue,
    hostScreenWatchedForSeconds: 60,
    hostScreenSamples: samples.length,
    hostScreenDistinctStates: distinct.length,
    hostScreenBefore: before,
    hostScreenNow: samples[samples.length - 1],
    remainingParticipantCannotTakeOver: takeover,
    knockerScreen: knockScreen.excerpt,
    knockAgeSeconds: Math.round((Date.now() - knockedAt) / 1000),
  };
  if (!(serverQueue.status === 200 && serverQueue.waiting.length >= 1 && distinct.length === 1)) {
    out.leftToDo = 'Не достигнуто состояние находки: нужен живой стук в очередь при вышедшем ведущем и '
                 + `неизменный экран ведущего. Сейчас: очередь ${JSON.stringify(serverQueue)}, состояний экрана ${distinct.length}. `
                 + 'Судить по этому экрану нельзя.';
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.leftToDo = `Экран Calls у ведущего, который вышел из звонка «${name}». Прямо сейчас в очереди на вход `
               + `стоит человек (сервер отдаёт его тому же ведущему по /waiting), но за 60 с непрерывного наблюдения `
               + `на экране не изменилось ничего: ни записи в уведомлениях, ни счётчика на колокольчике `
               + `(${before.bell}), ни отметки на карточке живого звонка — на ней только кнопка Join. `
               + `Убедитесь в этом сами, а затем нажмите Join на карточке живого звонка: заявка появится `
               + `сразу, с кнопками Admit и Deny — она всё это время была жива, до ведущего просто не доходил сигнал.`;
  return out;
};
