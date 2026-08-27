/* B — «Ведущий убрал пароль со звонка — стоящий у парольного барьера остаётся перед ним».
 * Скрипт делает шаги 1-2 находки, шаги 3-4 (снять пароль и смотреть чужой экран)
 * остаются человеку. Оба окна расставляются рядом, чтобы их было видно одновременно.
 *   ./d b:alice snip/b-password-barrier.mjs      (окно у барьера — carol — поднимается само)
 */
import { second, placeHalf } from './b-second.mjs';

const WS = 'W4QBF1XTURESO01';
const HOSTURL = 'https://staging.airion-cargo.store';
const MINE = '^QA [a-z]+ \\d{6}$';
const PW = 'Secret123';

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

export default async ({ page, ctx, browser, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const name = `QA pwbar ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  out.preflight = { host: await endOwnLeftover(page) };
  if (out.preflight.host.foreign) {
    out.leftToDo = `Это окно уже в звонке «${out.preflight.host.name}». Выйдите из него и запустите снippet заново.`;
    return out;
  }

  // шаг 1a — начать звонок
  await page.goto(`${HOSTURL}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.evaluate(() => { const b = document.querySelector('[data-testid="calls-hub-start-now"]'); if (b) b.click(); });
  await page.waitForTimeout(3000);
  const ni = await page.$('[role=dialog] input[type=text], [role=dialog] input:not([type])');
  if (!ni) { out.leftToDo = 'Диалог Start a call не открылся — состояние не достигнуто.'; return out; }
  await ni.fill(name);
  await page.evaluate(() => { const r = [...document.querySelectorAll('[role=dialog] input[type=radio]')].find(x => x.value === 'open'); if (r) r.click(); });
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(x => x.getBoundingClientRect().width > 0).pop();
    const b = [...d.querySelectorAll('button')].find(x => /^Start call$/i.test((x.innerText || '').trim()));
    if (b) b.click();
  });
  await page.waitForTimeout(9000);
  const mid = (page.url().match(/\/call\/([A-Za-z0-9]+)/) || [])[1] || null;
  if (!mid) { out.leftToDo = `Звонок не начался: адрес ${page.url()}. Состояние не достигнуто.`; return out; }

  // шаг 1b — включить в настройках встречи защиту паролем
  const settingsOpen = async () => await page.evaluate(() => {
    const b = document.querySelector('[data-testid="call-controls-settings-toggle"]');
    return b ? b.getAttribute('aria-pressed') === 'true' : false;
  });
  if (!await settingsOpen()) {
    await page.evaluate(() => { const b = document.querySelector('[data-testid="call-controls-settings-toggle"]'); if (b) b.click(); });
    await page.waitForTimeout(3500);
  }
  const pwToggle = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="meeting-settings-password-toggle"]');
    return b ? b.getAttribute('aria-checked') : 'not-found';
  });
  if (pwToggle === 'not-found') { out.leftToDo = 'Панель Meeting settings не открылась — состояние не достигнуто.'; return out; }
  if (pwToggle !== 'true') {
    await page.evaluate(() => { const b = document.querySelector('[data-testid="meeting-settings-password-toggle"]'); if (b) b.click(); });
    await page.waitForTimeout(1500);
  }
  const pwField = await page.$('input[type=password]');
  if (!pwField) { out.leftToDo = 'Поле пароля в Meeting settings не появилось — состояние не достигнуто.'; return out; }
  await pwField.fill(PW);
  await page.waitForTimeout(600);
  await page.evaluate(() => { const b = document.querySelector('[data-testid="meeting-settings-save"]'); if (b) b.click(); });
  await page.waitForTimeout(6000);
  const onServer = await page.evaluate(async id => {
    const j = await (await fetch(`/api/v1/meeting/${id}`, { credentials: 'include' })).json().catch(() => null);
    const m = j && (j.meeting || j);
    return m && { password_protected: m.password_protected };
  }, mid);
  if (!onServer || onServer.password_protected !== true) {
    out.leftToDo = `Защита паролем не включилась (${JSON.stringify(onServer)}) — состояние не достигнуто.`;
    return out;
  }
  progress(1); out.stepsDone = 1;

  // шаг 2 — другой участник доходит до экрана ввода пароля и ничего не вводит
  const c = await second('B', 'carol');
  out.barrierBrowser = { port: c.port, account: c.email, ensured: c.ensured };
  await endOwnLeftover(c.page);
  await c.page.goto(`${HOSTURL}/w/${WS}/call/${mid}`, { waitUntil: 'domcontentloaded' });
  await c.page.waitForTimeout(7000);
  const jbox = await c.page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const b = [...document.querySelectorAll('button')].filter(vis).find(x => /^Join$/i.test((x.innerText || '').trim()));
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  });
  if (!jbox) { out.leftToDo = 'На экране входа второго участника нет кнопки Join — состояние не достигнуто.'; return out; }
  await c.page.mouse.click(jbox.x, jbox.y);
  await c.page.waitForTimeout(9000);
  const barrier = await c.page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const t = document.body.innerText.replace(/\s+/g, ' ');
    const join = [...document.querySelectorAll('button')].filter(vis).find(x => /^Join call$/i.test((x.innerText || '').trim()));
    return {
      isBarrier: /password-protected/i.test(t),
      screenTail: t.slice(-160),
      passwordFieldValues: [...document.querySelectorAll('input[type=password]')].filter(vis).map(i => i.value),
      joinCallDisabled: join ? (join.disabled === true || join.getAttribute('aria-disabled') === 'true') : null,
      buttons: [...document.querySelectorAll('button')].filter(vis).map(b => (b.innerText || '').trim()).filter(Boolean).slice(-4),
    };
  });
  if (!(barrier.isBarrier && barrier.joinCallDisabled === true && barrier.passwordFieldValues.join('') === '')) {
    out.leftToDo = `Второй участник не встал у парольного барьера (${JSON.stringify(barrier)}) — состояние не достигнуто.`;
    return out;
  }
  progress(2); out.stepsDone = 2;

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  // панель Meeting settings у ведущего должна остаться открытой — это setup, сам тумблер жмёт человек
  if (!await settingsOpen()) {
    await page.evaluate(() => { const b = document.querySelector('[data-testid="call-controls-settings-toggle"]'); if (b) b.click(); });
    await page.waitForTimeout(3000);
  }
  const hostReady = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="meeting-settings-password-toggle"]');
    const s = document.querySelector('[data-testid="meeting-settings-save"]');
    return { passwordToggleChecked: b ? b.getAttribute('aria-checked') : null, saveButtonPresent: !!s };
  });
  await placeHalf(c, 'right');
  await placeHalf({ browser, ctx, page }, 'left');

  out.asserted = {
    call: name,
    serverBeforeTheChange: onServer,
    barrierScreen: barrier,
    hostSettingsPanel: hostReady,
    hostWindow: 'левая половина экрана',
    barrierWindow: `правая половина экрана, порт ${c.port}, ${c.email}`,
  };
  if (!(hostReady.passwordToggleChecked === 'true' && hostReady.saveButtonPresent)) {
    out.leftToDo = 'Не достигнуто состояние находки: у ведущего должна быть открыта панель Meeting settings '
                 + `с включённым тумблером Password protection. Сейчас: ${JSON.stringify(hostReady)}. Судить нельзя.`;
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.leftToDo = `Слева — окно ведущего с открытой панелью Meeting settings; справа — окно человека, `
               + `который стоит у парольного барьера звонка «${name}»: «This call is password-protected», `
               + `поле пустое, кнопка Join call заблокирована. Выключите слева тумблер Password protection `
               + `и нажмите Save, затем смотрите на правое окно, НЕ перезагружая его: барьер там не исчезнет — `
               + `тот же экран, то же пустое поле, та же заблокированная кнопка. `
               + `(Контроль, если захотите: введите в это поле любую строку — кнопка разблокируется и человек `
               + `сразу войдёт в звонок, потому что пароля у звонка уже нет.)`;
  return out;
};
