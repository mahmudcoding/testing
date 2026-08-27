/* B — «Гость, потерявший связь из side room, навсегда занимает место в звонке».
 * Скрипт делает шаги 1-4 находки, шаг 5 (выставить лимит по реальному числу людей)
 * остаётся человеку — на окне ведущего, которое скрипт выводит наверх.
 *   ./d b:guest snip/b-guest-sideroom-seat.mjs      (окно ведущего — alice — поднимается само)
 *
 * Гость входит во ВТОРОЙ вкладке окна `guest`: её и убивают через CDP /json/close,
 * а вкладка-драйвер переживает обрыв и продолжает вести прогон.
 */
import { second, tile, signOut } from './b-second.mjs';
import { rigPort } from '../rigmap.mjs';

const WS = 'W4QBF1XTURESO01';
const HOSTURL = 'https://staging.airion-cargo.store';
const MINE = '^QA [a-z]+ \\d{6}$';

export default async ({ page, ctx, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const name = `QA seat ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const guestName = `Guest ${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  out.signedOut = await signOut(ctx, page);
  const stillIn = await page.evaluate(async () => {
    const r = await fetch('/api/v1/auth/me', { credentials: 'include' });
    return r.ok ? (await r.json()).email : null;
  }).catch(() => null);
  if (stillIn) { out.leftToDo = `Это окно всё ещё залогинено (${stillIn}) — гостя так не изобразить. Состояние не достигнуто.`; return out; }

  // шаг 1a — ведущий начинает звонок
  const a = await second('B', 'alice');
  out.hostBrowser = { port: a.port, account: a.email, ensured: a.ensured };
  const pre = await a.page.evaluate(async mine => {
    const j = await (await fetch('/api/v1/meetings/current', { credentials: 'include' })).json().catch(() => null);
    const m = j && j.meeting;
    if (!m || m.status !== 'active') return { inCall: false };
    if (!new RegExp(mine).test(m.name || '')) return { inCall: true, foreign: true, name: m.name };
    await fetch(`/api/v1/meeting/${m.id}/end`, { method: 'POST', credentials: 'include' });
    return { inCall: true, foreign: false, ended: m.name };
  }, MINE);
  out.preflightHost = pre;
  if (pre.foreign) { out.leftToDo = `Окно ведущего уже в звонке «${pre.name}». Выйдите из него и запустите снippet заново.`; return out; }
  await a.page.goto(`${HOSTURL}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
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

  // шаг 1b — гость входит по ссылке-приглашению, во второй вкладке
  await a.page.evaluate(() => { const b = document.querySelector('[data-testid="call-controls-add-to-call"]'); if (b) b.click(); });
  await a.page.waitForTimeout(3500);
  const link = await a.page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')]
      .filter(x => x.getBoundingClientRect().width > 0 && x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    if (!d) return null;
    return [...d.querySelectorAll('input,textarea')].map(i => String(i.value || '')).find(s => /\/join\//.test(s)) || null;
  });
  if (!link) { out.leftToDo = 'В диалоге Add to call не нашлась ссылка-приглашение — состояние не достигнуто.'; return out; }
  await a.page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')]
      .filter(x => x.getBoundingClientRect().width > 0 && x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    const b = d && [...d.querySelectorAll('button')].find(x => /^Close$/i.test((x.innerText || '').trim()));
    if (b) b.click();
  });
  const gp = await ctx.newPage();
  await gp.goto(link, { waitUntil: 'domcontentloaded' });
  await gp.waitForTimeout(6000);
  const gn = await gp.$('input[type=text]');
  if (!gn) { out.leftToDo = 'На гостевом экране нет поля имени — состояние не достигнуто.'; return out; }
  await gn.fill(guestName);
  await gp.waitForTimeout(1000);
  const gbox = await gp.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0)
      .find(x => /^(Join call|Ask to join)$/i.test((x.innerText || '').trim()));
    if (!b || b.disabled) return null;
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  if (!gbox) { out.leftToDo = 'Кнопка входа на гостевом экране недоступна — состояние не достигнуто.'; return out; }
  await gp.mouse.click(gbox.x, gbox.y);
  await gp.waitForTimeout(11000);
  if (!/\/guest\/meeting\//.test(gp.url())) { out.leftToDo = `Гость не вошёл в звонок (адрес ${gp.url()}) — состояние не достигнуто.`; return out; }
  progress(1); out.stepsDone = 1;

  // шаг 2 — создать side room и перевести гостя в неё
  await a.page.evaluate(() => { const b = document.querySelector('[data-testid="call-controls-breakout-rooms"]'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); });
  await a.page.waitForTimeout(2500);
  await a.page.evaluate(() => { const b = document.querySelector('[data-testid="side-rooms-new"]'); if (b) b.click(); });
  await a.page.waitForTimeout(3000);
  const rn = await a.page.$('[data-testid="side-room-create-name"]');
  if (!rn) { out.leftToDo = 'Диалог New Side Room не открылся — состояние не достигнуто.'; return out; }
  await rn.fill('QA room');
  await a.page.waitForTimeout(600);
  await a.page.evaluate(g => {
    const b = [...document.querySelectorAll('[data-testid="side-room-create-invitee"]')].find(x => (x.innerText || '').includes(g));
    if (b) b.click();
  }, guestName);
  await a.page.waitForTimeout(1200);
  await a.page.evaluate(() => { const b = document.querySelector('[data-testid="side-room-create-submit"]'); if (b) b.click(); });
  await a.page.waitForTimeout(7000);
  // гость сам заходит в открытую комнату
  await gp.evaluate(() => { const b = document.querySelector('[data-testid="call-controls-breakout-rooms"]'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); });
  await gp.waitForTimeout(5000);
  // Гость получает либо приглашение (Accept), либо кнопку Join у открытой комнаты;
  // и то и другое появляется не мгновенно, поэтому ждём, а не снимаем один кадр.
  let rbox = null;
  for (let i = 0; i < 20 && !rbox; i++) {
    rbox = await gp.evaluate(() => {
      const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const accept = [...document.querySelectorAll('button')].filter(vis)
        .find(x => /^Accept$/i.test((x.innerText || '').trim()));
      const join = [...document.querySelectorAll('[data-testid="side-room-action"]')].filter(vis)
        .find(x => /^Join$/i.test((x.innerText || '').trim()));
      const b = accept || join;
      if (!b) return null;
      b.scrollIntoView({ block: 'center' });
      const r = b.getBoundingClientRect();
      return { via: accept ? 'Accept' : 'Join', x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    });
    if (!rbox) await gp.waitForTimeout(2000);
  }
  if (!rbox) { out.leftToDo = 'У гостя за 40 с не появилось ни приглашения в side room, ни кнопки Join — состояние не достигнуто.'; return out; }
  out.guestEnteredRoomVia = rbox.via;
  await gp.mouse.click(rbox.x, rbox.y);
  await gp.waitForTimeout(10000);
  const inRoom = await a.page.evaluate(async id => {
    const j = await (await fetch(`/api/v1/meeting/${id}/participants`, { credentials: 'include' })).json().catch(() => null);
    const arr = (j && (j.participants || j.items || j.data)) || [];
    const g = arr.find(p => (p.type || p.participant_type) === 'guest');
    return g ? { name: g.name, in_breakout: g.in_breakout === true, left_at: g.left_at || null } : null;
  }, mid);
  if (!inRoom || !inRoom.in_breakout) { out.leftToDo = `Гость не оказался в side room (${JSON.stringify(inRoom)}) — состояние не достигнуто.`; return out; }
  progress(2); out.stepsDone = 2;

  // шаг 3 — оборвать гостя аварийно: вкладка убивается через CDP, обычного выхода нет
  const s = await ctx.newCDPSession(gp);
  const ti = await s.send('Target.getTargetInfo');
  const port = rigPort('B', 'guest');
  const killedAt = new Date().toISOString();
  const killed = await fetch(`http://127.0.0.1:${port}/json/close/${ti.targetInfo.targetId}`).then(r => r.text()).catch(e => 'ERR ' + e.message);
  out.guestTabKilled = { targetId: ti.targetInfo.targetId, response: killed, at: killedAt };
  progress(3); out.stepsDone = 3;

  // шаг 4 — смотреть на список участников и счётчик у ведущего
  const samples = [];
  for (let i = 0; i < 4; i++) {
    await a.page.waitForTimeout(20000);
    samples.push(await a.page.evaluate(async ([id, ws]) => {
      const j = await (await fetch(`/api/v1/meeting/${id}/participants`, { credentials: 'include' })).json().catch(() => null);
      const arr = (j && (j.participants || j.items || j.data)) || [];
      const m = await (await fetch(`/api/v1/workspace/${ws}/meetings/active`, { credentials: 'include' })).json().catch(() => null);
      const mm = ((m && m.meetings) || []).find(x => x.id === id);
      const g = arr.find(p => (p.type || p.participant_type) === 'guest');
      return {
        at: new Date().toISOString(),
        guestRow: g ? { name: g.name, type: g.type || g.participant_type, left_at: g.left_at || null, in_breakout: g.in_breakout } : null,
        stillInCall: arr.filter(p => !p.left_at).length,
        participant_count: mm && mm.participant_count,
      };
    }, [mid, WS]));
  }
  progress(4); out.stepsDone = 4;

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  const last = samples[samples.length - 1];
  const realPeople = 1;   // в звонке остался только ведущий
  await tile(a);

  out.asserted = {
    call: name,
    guest: guestName,
    guestJoinedViaInviteLink: true,
    guestWasInSideRoom: inRoom,
    guestTabKilledAbruptly_noLeaveCall: out.guestTabKilled,
    samplesAfterTheKill: samples,
    realPeopleStillInTheCall: realPeople,
    serverStillCounts: last.participant_count,
    hostWindow: `порт ${a.port}, ${a.email}`,
  };
  if (!(last.guestRow && last.guestRow.left_at === null && last.participant_count >= 2)) {
    out.leftToDo = 'Не достигнуто состояние находки: после обрыва гостя из side room его строка должна остаться '
                 + `в /participants, а счётчик — показывать 2. Сейчас: ${JSON.stringify(last)}. Судить нельзя.`;
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.leftToDo = `Окно ведущего выведено наверх. Гость «${guestName}» вошёл по ссылке, был переведён в side room `
               + `и оборван аварийно (вкладку убили, Leave call не нажимали) ${Math.round((Date.now() - Date.parse(killedAt)) / 1000)} с назад. `
               + `В звонке реально остался один человек, а сервер по-прежнему считает ${last.participant_count}. `
               + `Осталось сделать шаг 5: у ведущего открыть Meeting settings и выставить Participant limit равным `
               + `числу реально присутствующих (1), затем Save — сервер откажет: «The limit cannot be lower than the `
               + `number of people already in the call.»`;
  return out;
};
