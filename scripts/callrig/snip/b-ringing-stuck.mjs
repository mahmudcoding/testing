/* B — «После неотвеченного приглашения строка участника навсегда остаётся Ringing…».
 * Скрипт делает шаги 1-3 находки, шаг 4 (снова открыть Add to call и посмотреть на строку)
 * остаётся человеку — на окне ведущего, которое выводится наверх.
 *   ./d b:bob snip/b-ringing-stuck.mjs      (окно ведущего — alice — поднимается само)
 *
 * Драйвер — bob: это он получает вызов и не отвечает на него, и именно его окно
 * доказывает, что приглашение дошло, а не потерялось.
 */
import { second, tile } from './b-second.mjs';

const WS = 'W4QBF1XTURESO01';
const HOSTURL = 'https://staging.airion-cargo.store';
const MINE = '^QA [a-z]+ \\d{6}$';
const ME = 'QA Bob';

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

/** Строка участника в Add to call: наименьший видимый элемент, содержащий и имя, и чекбокс. */
const ROW = `(name) => {
  const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const d = [...document.querySelectorAll('[role=dialog]')]
    .filter(x => vis(x) && x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
  if (!d) return null;
  const c = [...d.querySelectorAll('div,li,label')]
    .filter(e => vis(e) && (e.innerText || '').includes(name) && e.querySelector('input[type=checkbox]'))
    .sort((a, b) => (a.innerText || '').length - (b.innerText || '').length)[0];
  if (!c) return null;
  return { text: (c.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 70),
           checkboxDisabled: c.querySelector('input[type=checkbox]').disabled };
}`;

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const name = `QA ring ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  out.preflight = { invitee: await endOwnLeftover(page) };
  if (out.preflight.invitee.foreign) {
    out.leftToDo = `Это окно уже в звонке «${out.preflight.invitee.name}». Выйдите из него и запустите снippet заново.`;
    return out;
  }
  // приглашённый должен быть «в приложении», но не в звонке: свежая загрузка рабочего экрана
  await page.goto(`${HOSTURL}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // шаг 1 — ведущий начинает звонок и открывает Add to call
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
  await a.page.evaluate(() => { const b = document.querySelector('[data-testid="call-controls-add-to-call"]'); if (b) b.click(); });
  await a.page.waitForTimeout(3500);
  const rowBefore = await a.page.evaluate(([row, me]) => eval(row)(me), [ROW, ME]);
  if (!rowBefore || rowBefore.checkboxDisabled) {
    out.leftToDo = `Строка приглашаемого в Add to call недоступна с самого начала (${JSON.stringify(rowBefore)}) — состояние не достигнуто.`;
    return out;
  }
  progress(1); out.stepsDone = 1;

  // шаг 2 — отметить коллегу и нажать Invite
  const invited = await a.page.evaluate(me => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const d = [...document.querySelectorAll('[role=dialog]')].filter(x => vis(x) && x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    const c = [...d.querySelectorAll('div,li,label')]
      .filter(e => vis(e) && (e.innerText || '').includes(me) && e.querySelector('input[type=checkbox]'))
      .sort((x, y) => (x.innerText || '').length - (y.innerText || '').length)[0];
    if (!c) return null;
    const cb = c.querySelector('input[type=checkbox]');
    if (cb.disabled) return null;
    cb.click();
    return true;
  }, ME);
  if (!invited) { out.leftToDo = 'Не удалось отметить приглашаемого в Add to call — состояние не достигнуто.'; return out; }
  await a.page.waitForTimeout(1500);
  const inviteLabel = await a.page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const d = [...document.querySelectorAll('[role=dialog]')].filter(x => vis(x) && x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    const b = [...d.querySelectorAll('button')].filter(vis).find(x => /^Invite \(/.test((x.innerText || '').trim()));
    if (!b) return null;
    b.click();
    return (b.innerText || '').trim();
  });
  if (!inviteLabel) { out.leftToDo = 'В диалоге Add to call нет кнопки Invite (N) — состояние не достигнуто.'; return out; }
  const invitedAt = Date.now();
  progress(2); out.stepsDone = 2;

  // шаг 3 — не отвечать; дождаться истечения вызова. Приглашённый должен сначала УВИДЕТЬ вызов —
  // иначе «строка застряла» неотличимо от «приглашение не дошло».
  const seen = { calling: null, missed: null, acceptDecline: null };
  for (let i = 0; i < 40; i++) {
    const s = await page.evaluate(() => {
      const vis = el => { const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
      const t = document.body.innerText.replace(/\s+/g, ' ');
      return {
        calling: /is calling/i.test(t), missed: /Missed call/i.test(t),
        buttons: [...document.querySelectorAll('button')].filter(vis)
          .map(b => (b.innerText || b.getAttribute('aria-label') || '').trim()).filter(x => /^(Accept|Decline)$/i.test(x)),
        excerpt: (t.match(/.{0,20}(is calling|Missed call).{0,40}/i) || [])[0] || null,
      };
    });
    if (s.calling && !seen.calling) { seen.calling = s.excerpt; seen.acceptDecline = s.buttons; }
    if (s.missed && !seen.missed) { seen.missed = s.excerpt; break; }
    await page.waitForTimeout(3000);
  }
  if (!seen.calling) { out.leftToDo = 'Приглашённому вообще не пришёл входящий вызов — состояние не достигнуто (это была бы другая находка).'; return out; }
  if (!seen.missed) { out.leftToDo = 'Вызов у приглашённого не истёк за 2 минуты — состояние не достигнуто.'; return out; }
  progress(3); out.stepsDone = 3;

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  // заглянуть в диалог у ведущего (страница НЕ перезагружалась), измерить строку и снова закрыть —
  // повторное открытие остаётся человеку, как в шаге 4 находки
  await a.page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const d = [...document.querySelectorAll('[role=dialog]')].filter(x => vis(x) && x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    const b = d && [...d.querySelectorAll('button')].find(x => /^Close$/i.test((x.innerText || '').trim()));
    if (b) b.click();
  });
  await a.page.waitForTimeout(2000);
  await a.page.evaluate(() => { const b = document.querySelector('[data-testid="call-controls-add-to-call"]'); if (b) b.click(); });
  await a.page.waitForTimeout(3500);
  const peek = await a.page.evaluate(([row, me, others]) => {
    const R = eval(row);
    const o = {};
    for (const n of others) o[n] = R(n);
    return { target: R(me), others: o };
  }, [ROW, ME, ['QA Carol', 'QA Dave']]);
  // не мгновенная вспышка: то же самое ещё раз через 45 с, без перезагрузки
  await a.page.waitForTimeout(45000);
  const peekLater = await a.page.evaluate(([row, me]) => eval(row)(me), [ROW, ME]);
  await a.page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const d = [...document.querySelectorAll('[role=dialog]')].filter(x => vis(x) && x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    const b = d && [...d.querySelectorAll('button')].find(x => /^Close$/i.test((x.innerText || '').trim()));
    if (b) b.click();
  });
  await a.page.waitForTimeout(1500);
  await tile(a);

  out.asserted = {
    call: name,
    inviteSentAs: inviteLabel,
    inviteeRowBeforeTheInvite: rowBefore,
    inviteeSawTheIncomingCall: seen,
    inviteeNeverAnswered: true,
    hostRowAfterExpiry: peek.target,
    hostRowAfterExpiryPlus45s: peekLater,
    otherRowsInTheSameDialog: peek.others,
    hostPageWasNotReloaded: true,
    ageSeconds: Math.round((Date.now() - invitedAt) / 1000),
    hostWindow: `порт ${a.port}, ${a.email}`,
  };
  if (!(peek.target && /Ringing/i.test(peek.target.text) && peek.target.checkboxDisabled === true
        && peekLater && peekLater.checkboxDisabled === true)) {
    out.leftToDo = 'Не достигнуто состояние находки: после истечения вызова строка приглашённого должна остаться '
                 + `«Ringing…» с недоступным флажком. Сейчас: ${JSON.stringify({ peek, peekLater })}. Судить нельзя.`;
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.leftToDo = `Наверх выведено окно ведущего — оно в звонке «${name}» и НЕ перезагружалось. `
               + `Приглашённый вызов получил («${seen.calling}») и не ответил, вызов истёк («${seen.missed}»). `
               + `Откройте у ведущего Add to call и посмотрите на строку ${ME}: она читается «${peek.target.text}», `
               + `флажок недоступен, позвать этого человека ещё раз в этом звонке нечем. `
               + `Соседние строки того же диалога при этом свободны и выбираются.`;
  return out;
};
