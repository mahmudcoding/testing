/* B — «Гостю по нерабочей ссылке говорят, что дело в ссылке, а не в том, что звонок
 *      кончился, и не дают ни одной кнопки».
 * Скрипт делает шаги 1-3 находки, шаг 4 (сравнение с экраном участника
 * рабочего пространства) остаётся человеку.
 *   ./d b:guest snip/b-guest-deadlink.mjs      (окно ведущего — alice — поднимается само)
 */
import { second, signOut } from './b-second.mjs';

const WS = 'W4QBF1XTURESO01';
const HOSTURL = 'https://staging.airion-cargo.store';
const MINE = '^QA [a-z]+ \\d{6}$';

export default async ({ page, ctx, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const name = `QA dead ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  out.signedOut = await signOut(ctx, page);
  const stillIn = await page.evaluate(async () => {
    const r = await fetch('/api/v1/auth/me', { credentials: 'include' });
    return r.ok ? (await r.json()).email : null;
  }).catch(() => null);
  if (stillIn) {
    out.leftToDo = `Это окно всё ещё залогинено (${stillIn}) — гостевой экран так не проверить. Состояние не достигнуто.`;
    return out;
  }

  // шаг 1 — ведущий начинает звонок и копирует ссылку-приглашение из Add to call
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
  if (pre.foreign) {
    out.leftToDo = `Окно ведущего уже в звонке «${pre.name}». Выйдите из него и запустите снippet заново.`;
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
  const link = await a.page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')]
      .filter(x => x.getBoundingClientRect().width > 0 && x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    if (!d) return null;
    return [...d.querySelectorAll('input,textarea')].map(i => String(i.value || '')).find(s => /\/join\//.test(s)) || null;
  });
  if (!link) { out.leftToDo = 'В диалоге Add to call не нашлась ссылка-приглашение — состояние не достигнуто.'; return out; }
  progress(1); out.stepsDone = 1;

  // шаг 2 — завершить звонок
  const ended = await a.page.evaluate(async id => {
    const r = await fetch(`/api/v1/meeting/${id}/end`, { method: 'POST', credentials: 'include' });
    await new Promise(r2 => setTimeout(r2, 2500));
    const m = await (await fetch(`/api/v1/meeting/${id}`, { credentials: 'include' })).json().catch(() => null);
    const mm = m && (m.meeting || m);
    return { end: r.status, status: mm && mm.status };
  }, mid);
  if (ended.status !== 'ended') { out.leftToDo = `Звонок не завершился (${JSON.stringify(ended)}) — состояние не достигнуто.`; return out; }
  progress(2); out.stepsDone = 2;

  // шаг 3 — открыть ту же ссылку в браузере, где нет входа в приложение
  await page.goto(link, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  progress(3); out.stepsDone = 3;

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  const probe = await page.evaluate(() => {
    const vis = el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      let o = 1, n = el;
      while (n && n !== document.documentElement) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        o *= parseFloat(cs.opacity || '1'); n = n.parentElement;
      }
      return o > 0.05;
    };
    const all = [...document.querySelectorAll('button, a[href], input, select, textarea, summary, [role=button], [role=link], [tabindex]:not([tabindex="-1"])')];
    return {
      url: location.href,
      bodyText: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 250),
      interactiveInWholeDocument: all.length,
      interactive: all.map(e => ({ tag: e.tagName, text: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40), ariaLabel: e.getAttribute('aria-label'), href: e.getAttribute('href'), visible: vis(e) })),
    };
  });

  const memberUrl = `${HOSTURL}/w/${WS}/call/${mid}`;
  out.asserted = {
    url: probe.url,
    signedInAs: null,
    call: name,
    callStatus: ended.status,
    guestScreenText: probe.bodyText,
    interactiveCountWholeDocument: probe.interactiveInWholeDocument,
    interactive: probe.interactive,
    sameCallForAWorkspaceMember: memberUrl,
  };
  if (!/no longer valid/i.test(probe.bodyText)) {
    out.leftToDo = 'Не достигнуто состояние находки: нужен гостевой экран по ссылке на уже завершённый звонок. '
                 + `Сейчас на экране: «${probe.bodyText.slice(0, 120)}». Судить по этому экрану нельзя.`;
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.leftToDo = `Это гостевой экран по ссылке на звонок «${name}», который только что завершился: `
               + `«${probe.bodyText}». Причина названа неверно — про ссылку, хотя ссылка живая, а звонок прошёл. `
               + `ВНИМАНИЕ: вторая половина находки на текущей сборке уже исправлена — экран больше не пустой, `
               + `на нём ${probe.interactiveInWholeDocument} интерактивный элемент `
               + `(${probe.interactive.map(e => e.text).filter(Boolean).join(', ') || '—'}); `
               + `в отчёте в блоке измерения стоит interactiveCount: 0, это устарело. `
               + `Осталось сравнить формулировки: откройте в окне рабочего аккаунта тот же самый звонок — ${memberUrl} — `
               + `там названа верная причина («Call has ended»), дан совет и есть кнопка Back to workspace.`;
  return out;
};
