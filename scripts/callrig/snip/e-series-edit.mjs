/* Repro: editing one occurrence of a repeating meeting changes only that occurrence,
 * and the form never says so.
 * Report: lane E, "[FE-WEB][CALENDAR] Редактирование повторяющейся встречи меняет только одно вхождение…"
 *
 * Creates a fresh daily series, opens today's occurrence, opens Edit and types a new
 * title — you press Save and then look at the following days.
 */
import { DOM } from './lib.mjs';
const WS = 'W4QEF1XTURESO01';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const tag = Date.now().toString(36).slice(-4);
  const title = 'E daily series ' + tag;
  const newTitle = 'E daily series ' + tag + ' RENAMED';

  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // step 1 — a meeting that repeats Every day
  const series = await page.evaluate(async ({ ws, title }) => {
    const s = new Date(); s.setHours(s.getHours() + 5, 0, 0, 0);
    const e = new Date(s.getTime() + 30 * 60e3);
    const r = await fetch('/api/v1/calendar/meetings', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: ws, title, starts_at: s.toISOString(), ends_at: e.toISOString(),
        timezone: 'Asia/Tashkent', recurrence: { frequency: 'daily', interval_count: 1, occurrence_count: 4 } }),
    });
    const j = await r.json().catch(() => ({}));
    const from = new Date(Date.now() - 864e5).toISOString(), to = new Date(Date.now() + 10 * 864e5).toISOString();
    const lj = await (await fetch(`/api/v1/calendar/meetings?workspace_id=${ws}&from=${from}&to=${to}`,
      { credentials: 'include' })).json();
    return { status: r.status, recurrence_rule_id: j.meeting && j.meeting.recurrence_rule_id,
      occurrences: (lj.meetings || lj.data || []).filter((m) => m.title === title)
        .map((m) => ({ title: m.title, starts_at: m.starts_at })).sort((a, b) => a.starts_at.localeCompare(b.starts_at)) };
  }, { ws: WS, title });

  if (!series.recurrence_rule_id || series.occurrences.length < 2) {
    out.asserted = series;
    out.leftToDo = 'Could not create a repeating meeting — do not judge this screen. Create one by '
                 + 'hand: Calendar -> New meeting, Repeat = Every day, Schedule meeting.';
    return out;
  }
  progress(1);

  // step 2 — open the first occurrence from its chip in the grid
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  await page.evaluate(DOM);
  const chips = page.locator('button[data-testid="calendar-event-chip"]');
  const n = await chips.count();
  let opened = false;
  for (let i = 0; i < n; i++) {
    const t = await chips.nth(i).innerText().catch(() => '');
    if (t.includes(title)) {
      await chips.nth(i).scrollIntoViewIfNeeded();   // later-in-the-day chips sit below the fold
      await chips.nth(i).click();
      opened = true; break;
    }
  }
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  const detail = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
    return d ? { text: d.innerText.replace(/\n+/g, ' | ').slice(0, 200), repeats: /Repeats/i.test(d.innerText) } : null;
  });
  if (!opened || !detail || !detail.repeats) {
    out.asserted = { series, opened, detail };
    out.leftToDo = 'Could not open an occurrence of the series from the grid — do not judge this '
                 + 'screen. Click its chip by hand and follow the steps.';
    return out;
  }
  progress(2);

  // Edit, and type the new title — everything up to the Save click
  await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
    window.__qa.clickDeepest(/^Edit$/, d);
  });
  await page.waitForTimeout(2800);
  const ti = page.locator('[role=dialog] input[aria-label="Add title"], [role=dialog] input[placeholder="Add title"]').first();
  if (await ti.count()) { await ti.click(); await ti.fill(newTitle); }
  await page.waitForTimeout(800);
  await page.evaluate(DOM);

  out.asserted = await page.evaluate((nt) => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
    const t = d ? d.innerText : '';
    const inp = d && d.querySelector('input[aria-label="Add title"], input[placeholder="Add title"]');
    return {
      url: location.href,
      editFormOpen: /Edit meeting/i.test(t),
      titleFieldNow: inp ? inp.value : null,
      hasSave: !!(d && [...d.querySelectorAll('button')].some((b) => /^Save$/.test(window.__qa.nameOf(b)))),
      formMentionsScope: /this event|all events|this and following|series|occurrence/i.test(t),
    };
  }, newTitle);
  out.asserted.seriesBefore = series.occurrences;

  if (!out.asserted.editFormOpen || out.asserted.titleFieldNow !== newTitle || !out.asserted.hasSave) {
    out.leftToDo = 'The Edit form did not open with the new title typed in — do not judge this screen. '
                 + 'Follow the written steps by hand.';
    return out;
  }

  out.ready = true;
  out.stepsDone = 2;   // steps 1-2 done; Edit+Save is step 3, checking the neighbours is step 4
  out.leftToDo = `The Edit form for today's occurrence is open and the title now reads "${newTitle}". `
               + `The series has ${series.occurrences.length} occurrences, one per day, all still called `
               + `"${title}". Read the form for anything saying which of them the change will hit, then `
               + `press Save and look at tomorrow's chip in the grid. For comparison, open the same `
               + `occurrence again and press Delete — that dialog does name its scope.`;
  return out;
};
