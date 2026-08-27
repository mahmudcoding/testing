/* B — «Ожидающий перезагрузил страницу — ведущий впускает его, но в звонок никто не приходит».
 * Скрипт делает шаги 1-3 находки, шаг 4 (нажать Admit у ведущего) остаётся человеку;
 * окно ведущего выводится наверх с уже открытой панелью участников.
 *   ./d b:carol snip/b-admit-after-reload.mjs      (окно ведущего — alice — поднимается само)
 */
import { second, tile } from './b-second.mjs';

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

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const name = `QA reload ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  out.preflight = { waiter: await endOwnLeftover(page) };
  if (out.preflight.waiter.foreign) {
    out.leftToDo = `Это окно уже в звонке «${out.preflight.waiter.name}». Выйдите из него и запустите снippet заново.`;
    return out;
  }

  // шаг 1 — звонок с режимом входа, требующим одобрения
  const a = await second('B', 'alice');
  out.hostBrowser = { port: a.port, account: a.email, ensured: a.ensured };
  out.preflight.host = await endOwnLeftover(a.page);
  if (out.preflight.host.foreign) {
    out.leftToDo = `Окно ведущего уже в звонке «${out.preflight.host.name}». Выйдите из него и запустите снippet заново.`;
    return out;
  }
  await a.page.goto(`${HOSTURL}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await a.page.waitForTimeout(5000);
  await a.page.evaluate(() => { const b = document.querySelector('[data-testid="calls-hub-start-now"]'); if (b) b.click(); });
  await a.page.waitForTimeout(3000);
  const ni = await a.page.$('[role=dialog] input[type=text], [role=dialog] input:not([type])');
  if (!ni) { out.leftToDo = 'Диалог Start a call у ведущего не открылся — состояние не достигнуто.'; return out; }
  await ni.fill(name);
  await a.page.evaluate(() => {
    const pick = v => { const r = [...document.querySelectorAll('[role=dialog] input[type=radio]')].find(x => x.value === v); if (r) r.click(); };
    pick('public'); pick('manual_admit');
  });
  await a.page.waitForTimeout(800);
  await a.page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(x => x.getBoundingClientRect().width > 0).pop();
    const b = [...d.querySelectorAll('button')].find(x => /^Start call$/i.test((x.innerText || '').trim()));
    if (b) b.click();
  });
  await a.page.waitForTimeout(9000);
  const mid = (a.page.url().match(/\/call\/([A-Za-z0-9]+)/) || [])[1] || null;
  if (!mid) { out.leftToDo = `Звонок не начался: адрес ${a.page.url()}. Состояние не достигнуто.`; return out; }
  const flags = await a.page.evaluate(async id => {
    const j = await (await fetch(`/api/v1/meeting/${id}`, { credentials: 'include' })).json().catch(() => null);
    const m = j && (j.meeting || j);
    return m && { requires_approval: m.requires_approval };
  }, mid);
  if (!flags || flags.requires_approval !== true) {
    out.leftToDo = `Звонок создан без одобрения входа (${JSON.stringify(flags)}) — состояние не достигнуто.`;
    return out;
  }
  progress(1); out.stepsDone = 1;

  // шаг 2 — это окно открывает ссылку звонка и жмёт Join
  await page.goto(`${HOSTURL}/w/${WS}/call/${mid}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const jbox = await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const b = [...document.querySelectorAll('button')].filter(vis)
      .find(x => /^(Join|Join call|Ask to join|Join now)$/i.test((x.innerText || '').trim()));
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  if (!jbox) { out.leftToDo = 'На экране входа нет кнопки Join — состояние не достигнуто.'; return out; }
  await page.mouse.click(jbox.x, jbox.y);
  await page.waitForTimeout(9000);
  const waitingScreen = await page.evaluate(() => /Waiting for host approval/i.test(document.body.innerText));
  if (!waitingScreen) { out.leftToDo = 'Экран ожидания не появился — состояние не достигнуто.'; return out; }
  const queueBeforeReload = await a.page.evaluate(async id => {
    const r = await fetch(`/api/v1/meeting/${id}/waiting`, { credentials: 'include' });
    let b = null; try { b = await r.json(); } catch { }
    return { status: r.status, participants: ((b && b.participants) || []).map(p => ({ name: p.name, participant_type: p.participant_type, waited_since: p.waited_since })) };
  }, mid);
  progress(2); out.stepsDone = 2;

  // шаг 3 — перезагрузить страницу ожидающего
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(10000);
  const afterReload = await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const t = document.body.innerText.replace(/\s+/g, ' ');
    return {
      url: location.href,
      showsReadyToJoin: /READY TO JOIN/i.test(t),
      showsWaiting: /Waiting for host approval/i.test(t),
      notices: [...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(vis)
        .map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean),
      buttons: [...document.querySelectorAll('button')].filter(vis)
        .map(b => (b.innerText || b.getAttribute('aria-label') || '').trim()).filter(Boolean).slice(-6),
    };
  });
  const queueAfterReload = await a.page.evaluate(async id => {
    const r = await fetch(`/api/v1/meeting/${id}/waiting`, { credentials: 'include' });
    let b = null; try { b = await r.json(); } catch { }
    return { status: r.status, participants: ((b && b.participants) || []).map(p => ({ name: p.name, participant_type: p.participant_type, waited_since: p.waited_since })) };
  }, mid);
  progress(3); out.stepsDone = 3;

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  // открыть у ведущего панель участников, чтобы кнопка Admit была на виду — это setup,
  // само нажатие остаётся человеку
  await a.page.evaluate(() => {
    const b = document.querySelector('[data-testid="call-controls-people-toggle"]');
    if (b && b.getAttribute('aria-pressed') !== 'true') b.click();
  });
  await a.page.waitForTimeout(3000);
  const hostPanel = await a.page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const t = document.body.innerText.replace(/\s+/g, ' ');
    const admit = [...document.querySelectorAll('button')].filter(vis)
      .filter(x => /^Admit/i.test(x.getAttribute('aria-label') || '')).map(x => x.getAttribute('aria-label'));
    return { inCallText: (t.match(/\d+ in call/i) || [])[0] || null, admitButtons: admit };
  });
  await tile(a);

  out.asserted = {
    call: name,
    meetingFlags: flags,
    waiterScreenAfterReload: afterReload,
    hostQueueBeforeReload: queueBeforeReload,
    hostQueueAfterReload: queueAfterReload,
    queueEntrySurvivedUnchanged:
      queueBeforeReload.participants.length === 1 && queueAfterReload.participants.length === 1 &&
      queueBeforeReload.participants[0].waited_since === queueAfterReload.participants[0].waited_since,
    hostPanel,
    hostWindow: `порт ${a.port}, ${a.email}`,
  };
  if (!(afterReload.showsReadyToJoin && !afterReload.showsWaiting && hostPanel.admitButtons.length === 1
        && out.asserted.queueEntrySurvivedUnchanged)) {
    out.leftToDo = 'Не достигнуто состояние находки: после перезагрузки ожидающий должен видеть READY TO JOIN, '
                 + 'а у ведущего должна остаться ровно одна кнопка Admit с той же заявкой. '
                 + `Сейчас: ${JSON.stringify({ afterReload, hostPanel })}. Судить нельзя.`;
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.leftToDo = `Ожидающий перезагрузил страницу и теперь видит «READY TO JOIN?» с кнопкой Join — как будто и не просился; `
               + `никакого сообщения ему не показали. У ведущего заявка при этом на месте, с тем же waited_since. `
               + `Наверх выведено окно ведущего с открытой панелью участников. Нажмите там «${hostPanel.admitButtons[0]}» `
               + `и посмотрите на оба экрана: очередь у ведущего очистится, в звонке он останется один `
               + `(сейчас «${hostPanel.inCallText}»), а ожидающий так и будет стоять на «READY TO JOIN?».`;
  return out;
};
