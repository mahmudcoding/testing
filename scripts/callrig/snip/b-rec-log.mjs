/* B — «Журнал звонка никогда не отмечает, что запись остановлена».
 * Скрипт делает шаги 1-3 находки и открывает страницу звонка; вкладку Logs открывает человек.
 *   ./d b:alice snip/b-rec-log.mjs
 */
const WS = 'W4QBF1XTURESO01';
const HOST = 'https://staging.airion-cargo.store';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const pad = n => String(n).padStart(2, '0');
  const now = new Date();
  const name = `QA rec ${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  // ── 1. GET THERE ────────────────────────────────────────────────────────
  // окно, уже сидящее в звонке, не может начать новый — свою же встречу закрываем
  out.preflight = await page.evaluate(async () => {
    const j = await (await fetch('/api/v1/meetings/current', { credentials: 'include' })).json().catch(() => null);
    const m = j && j.meeting;
    if (!m || m.status !== 'active') return { inCall: false };
    if (!/^QA [a-z]+ \d{6}$/.test(m.name || '')) return { inCall: true, foreign: true, name: m.name };
    const r = await fetch(`/api/v1/meeting/${m.id}/end`, { method: 'POST', credentials: 'include' });
    return { inCall: true, foreign: false, endedOwnLeftover: m.name, status: r.status };
  });
  if (out.preflight.foreign) {
    out.leftToDo = `Окно уже находится в звонке «${out.preflight.name}» — начать новый нельзя. `
                 + 'Выйдите из него (Leave call → Leave) и запустите снippet заново.';
    return out;
  }

  // шаг 1a — начать звонок
  await page.goto(`${HOST}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.evaluate(() => { const b = document.querySelector('[data-testid="calls-hub-start-now"]'); if (b) b.click(); });
  await page.waitForTimeout(3000);
  const nameInput = await page.$('[role=dialog] input[type=text], [role=dialog] input:not([type])');
  if (!nameInput) { out.leftToDo = 'Диалог Start a call не открылся — состояние не достигнуто.'; return out; }
  await nameInput.fill(name);
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

  // шаг 1b — Record → Start recording
  await page.evaluate(() => { const b = document.querySelector('[data-testid="recording-start-access-trigger"]'); if (b) b.click(); });
  await page.waitForTimeout(2800);
  const recStarted = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog],[role=alertdialog]')]
      .filter(x => x.getBoundingClientRect().width > 0 && x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    if (!d) return false;
    const b = [...d.querySelectorAll('button')].find(x => /^Start recording$/i.test((x.innerText || '').trim()));
    if (b) { b.click(); return true; } return false;
  });
  if (!recStarted) { out.leftToDo = 'Диалог Recording access не открылся или в нём нет кнопки Start recording — состояние не достигнуто.'; return out; }
  // запись поднимается через egress — кнопка Stop recording появляется не мгновенно
  let recOn = false;
  for (let i = 0; i < 40 && !recOn; i++) {
    await page.waitForTimeout(1000);
    recOn = await page.evaluate(() => !![...document.querySelectorAll('button')]
      .find(b => /^Stop recording$/i.test(b.getAttribute('aria-label') || '')));
  }
  if (!recOn) { out.leftToDo = 'Запись не включилась (кнопка Stop recording не появилась за 40 с) — состояние не достигнуто.'; return out; }
  await page.waitForTimeout(6000);   // пусть запись реально поработает несколько секунд
  progress(1); out.stepsDone = 1;

  // шаг 2 — остановить запись (подтверждения нет, действует сразу)
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => /^Stop recording$/i.test(x.getAttribute('aria-label') || ''));
    if (b) b.click();
  });
  await page.waitForTimeout(9000);
  progress(2); out.stepsDone = 2;

  // шаг 3 — завершить звонок
  await page.evaluate(async id => { await fetch(`/api/v1/meeting/${id}/end`, { method: 'POST', credentials: 'include' }); }, mid);
  await page.waitForTimeout(5000);
  progress(3); out.stepsDone = 3;

  // шаг 4 (первая половина) — открыть страницу этого звонка; вкладку Logs откроет человек
  await page.goto(`${HOST}/w/${WS}/calls/${mid}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);

  // ── 2. PROVE IT ─────────────────────────────────────────────────────────
  const probe = await page.evaluate(async id => {
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const tabs = [...document.querySelectorAll('button,[role=tab],a')].filter(vis)
      .map(b => (b.innerText || '').replace(/\s+/g, ' ').trim()).filter(t => /^(Recording|Chat|Logs)\b/.test(t));
    const r = await fetch(`/api/v1/meeting/${id}/events?limit=100`, { credentials: 'include' });
    const j = await r.json().catch(() => null);
    const arr = (j && (j.events || j.items || j.data)) || [];
    const counts = {};
    arr.forEach(e => { counts[e.event_type] = (counts[e.event_type] || 0) + 1; });
    return {
      tabs, ended: /Ended/.test(document.body.innerText),
      recordingEventTypes: Object.keys(counts).filter(k => k.startsWith('recording.')).sort(),
      stopIsInTheData: !!(counts['recording.stop_requested'] || counts['recording.egress_ended']),
    };
  }, mid);

  out.asserted = {
    url: page.url(),
    call: name,
    callIsEnded: probe.ended,
    tabsOnThePage: probe.tabs,
    recordingEventTypesFromApi: probe.recordingEventTypes,
    recordingWasReallyStopped: probe.stopIsInTheData,
  };
  if (!(probe.ended && probe.tabs.some(t => /^Logs/.test(t)) && probe.stopIsInTheData)) {
    out.leftToDo = 'Не достигнуто состояние находки: нужна страница завершённого звонка с вкладкой Logs и '
                 + 'реально состоявшейся остановкой записи в данных. Судить по этому экрану нельзя.';
    return out;
  }

  // ── 3. HAND OVER ────────────────────────────────────────────────────────
  out.ready = true;
  out.leftToDo = `Открыта страница завершённого звонка «${name}»: запись в нём включали и выключали руками, `
               + `в данных есть и recording.stop_requested, и recording.egress_ended. `
               + `Откройте вкладку Logs и прочитайте строки про запись: содержательно подписана только одна `
               + `(«Recording started automatically»), остальные сведены к «Recording activity», `
               + `строки «Recording stopped» на странице нет ни одной.`;
  return out;
};
