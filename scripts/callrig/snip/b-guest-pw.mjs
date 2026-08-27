/* B — «На гостевом экране поле пароля подписано "private meetings only",
 *      хотя без него в публичный звонок не пустят».
 * Скрипт делает шаги 1-3 находки, шаг 4 остаётся человеку.
 *   ./d b:guest snip/b-guest-pw.mjs      (окно ведущего — alice — поднимается само)
 *
 * Драйвер — окно `guest`, и снippet сам приводит его в состояние «без входа в приложение»:
 * ensure.sh подписывает этот аккаунт, а гостевой экран ведёт себя как гостевой только
 * когда в браузере не залогинен никто.
 */
import { second, signOut } from './b-second.mjs';

const WS = 'W4QBF1XTURESO01';
const HOSTURL = 'https://staging.airion-cargo.store';
const MINE = '^QA [a-z]+ \\d{6}$';

export default async ({ page, ctx, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const name = `QA gpw ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const PW = 'Secret123';

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

  // шаг 1 — ведущий создаёт звонок Public + вход по паролю
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
  await a.page.evaluate(() => {
    const pick = v => { const r = [...document.querySelectorAll('[role=dialog] input[type=radio]')].find(x => x.value === v); if (r) r.click(); };
    pick('public'); pick('password');
  });
  await a.page.waitForTimeout(900);
  const pwField = await a.page.$('[role=dialog] input[type=password]');
  if (!pwField) { out.leftToDo = 'В диалоге Start a call не появилось поле пароля — состояние не достигнуто.'; return out; }
  await pwField.fill(PW);
  await a.page.waitForTimeout(500);
  await a.page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(x => x.getBoundingClientRect().width > 0).pop();
    const b = [...d.querySelectorAll('button')].find(x => /^Start call$/i.test((x.innerText || '').trim()));
    if (b) b.click();
  });
  await a.page.waitForTimeout(9000);
  const mid = (a.page.url().match(/\/call\/([A-Za-z0-9]+)/) || [])[1] || null;
  if (!mid) { out.leftToDo = `Звонок не начался: адрес ${a.page.url()}. Состояние не достигнуто.`; return out; }
  const meeting = await a.page.evaluate(async id => {
    const r = await fetch(`/api/v1/meeting/${id}`, { credentials: 'include' });
    const j = await r.json().catch(() => null); const m = j && (j.meeting || j);
    return m && { is_private: m.is_private, password_protected: m.password_protected, status: m.status };
  }, mid);
  if (!meeting || meeting.is_private !== false || meeting.password_protected !== true) {
    out.leftToDo = `Звонок получился не тем: ${JSON.stringify(meeting)}. Нужен публичный звонок с паролем. Состояние не достигнуто.`;
    return out;
  }
  progress(1); out.stepsDone = 1;

  // шаг 2 — забрать ссылку-приглашение из Add to call
  await a.page.evaluate(() => { const b = document.querySelector('[data-testid="call-controls-add-to-call"]'); if (b) b.click(); });
  await a.page.waitForTimeout(3500);
  const link = await a.page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')]
      .filter(x => x.getBoundingClientRect().width > 0 && x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    if (!d) return null;
    const v = [...d.querySelectorAll('input,textarea')].map(i => String(i.value || '')).find(s => /\/join\//.test(s));
    return v || null;
  });
  if (!link) { out.leftToDo = 'В диалоге Add to call не нашлась ссылка-приглашение — состояние не достигнуто.'; return out; }
  progress(2); out.stepsDone = 2;

  // шаг 3 — открыть её в браузере, где нет входа в приложение
  await page.goto(link, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
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
    const inputs = [...document.querySelectorAll('input,textarea')].filter(vis).map(i => ({
      type: i.type,
      label: ((i.labels && i.labels[0] && i.labels[0].innerText) || i.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(),
      required: i.required, value: String(i.value).slice(0, 20),
    }));
    const join = [...document.querySelectorAll('button')].filter(vis).find(b => /^Join call$/i.test((b.innerText || '').trim()));
    return {
      url: location.href,
      bodyText: document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 250),
      inputs,
      joinButton: join ? { text: 'Join call', disabled: join.disabled === true || join.getAttribute('aria-disabled') === 'true' } : null,
    };
  });

  const pwInput = probe.inputs.find(i => i.type === 'password');
  const nameInput = probe.inputs.find(i => i.type === 'text');
  out.asserted = {
    url: probe.url,
    signedInAs: null,
    call: name,
    meetingFlags: meeting,
    guestScreenText: probe.bodyText,
    nameField: nameInput || null,
    passwordFieldLabel: pwInput ? pwInput.label : null,
    passwordFieldRequired: pwInput ? pwInput.required : null,
    joinButton: probe.joinButton,
  };
  if (!(nameInput && pwInput && probe.joinButton && probe.joinButton.disabled)) {
    out.leftToDo = 'Не достигнуто состояние находки: нужен гостевой экран публичного звонка с паролем — '
                 + 'поле имени, поле пароля и заблокированная кнопка Join call. Судить по этому экрану нельзя.';
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.leftToDo = `Гостевой экран публичного звонка «${name}» (is_private: false, password_protected: true). `
               + `Поле пароля подписано «${pwInput.label}», поле не required. `
               + `Введите любое имя в «Your name» и НЕ трогайте поле пароля: кнопка Join call останется `
               + `заблокированной и ничего не объяснит, хотя подпись обещает, что пароль нужен только приватным встречам.`;
  return out;
};
