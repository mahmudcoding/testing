/* Repro: the Reminder choice in the meeting form has no effect.
 * Report: lane E, "[FE-WEB][CALENDAR] Выбор напоминания в форме встречи ни на что не влияет"
 *
 * Schedules the first meeting with "No reminder", then leaves the second one's form filled
 * in with "5 minutes before" chosen — you press Schedule meeting and watch what arrives.
 */
import { DOM, safeClick } from './lib.mjs';
const WS = 'W4QEF1XTURESO01';

const dlgText = (page) => page.evaluate(() => {
  const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
  return d ? d.innerText : '';
});

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const tag = Date.now().toString(36).slice(-4);
  const posted = [];
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.url().includes('/calendar/meetings')) posted.push(r.postData());
  });

  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);

  // local wall-clock HH:MM, N minutes from now — the form's time input is local
  const hhmm = (mins) => page.evaluate((m) => {
    const d = new Date(Date.now() + m * 60e3);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }, mins);

  const openForm = async (title, startMins) => {
    await page.evaluate(DOM);
    await page.evaluate(() => window.__qa.clickDeepest(/^New meeting$/));
    await page.waitForTimeout(2500);
    await page.evaluate(DOM);
    const ti = page.locator('[role=dialog] input[aria-label="Add title"], [role=dialog] input[placeholder="Add title"]').first();
    if (!(await ti.count())) return false;
    await ti.click(); await ti.fill(title);
    const st = page.locator('[role=dialog] input[aria-label="Starts time"]').first();
    if (await st.count()) { await st.click(); await st.fill(await hhmm(startMins)); await page.waitForTimeout(900); }
    return true;
  };

  // step 1 — a meeting with No reminder (the form's default), starting in 12 minutes
  const titleA = 'E reminder NONE ' + tag;
  if (!(await openForm(titleA, 12))) {
    out.leftToDo = 'The New meeting form did not open — do not judge this. Follow the steps by hand.';
    return out;
  }
  const remA = (await dlgText(page)).match(/No reminder/) ? 'No reminder' : 'unknown';
  const okA = await safeClick(page, '[role=dialog] button:has-text("Schedule meeting")');
  await page.waitForTimeout(4000);
  if (!okA.ok || !posted.length) {
    out.asserted = { okA, posted };
    out.leftToDo = 'The first meeting was not scheduled — do not judge this. Follow the steps by hand.';
    return out;
  }
  progress(1);

  // step 2 — a second meeting, this one asking for "5 minutes before"
  const titleB = 'E reminder 5MIN ' + tag;
  if (!(await openForm(titleB, 11))) {
    out.leftToDo = 'The second New meeting form did not open — do not judge this. Follow the steps by hand.';
    return out;
  }
  // the Reminder trigger sits below the dialog's fold: safeClick scrolls and re-reads the box
  const openedRem = await safeClick(page, '[role=dialog] button:has-text("Reminder")');
  await page.waitForTimeout(1600);
  await page.evaluate(DOM);
  const picked = await page.evaluate(() => window.__qa.popperPick(/^5 minutes before$/));
  await page.waitForTimeout(1500);
  await page.evaluate(DOM);

  out.asserted = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
    if (!d) return { formOpen: false };
    const names = [...d.querySelectorAll('button')].map((b) => window.__qa.nameOf(b));
    const g = (l) => { const i = d.querySelector(`input[aria-label="${l}"]`); return i ? i.value : null; };
    return {
      formOpen: /Schedule meeting/.test(d.innerText),
      title: (d.querySelector('input[aria-label="Add title"], input[placeholder="Add title"]') || {}).value || null,
      startsAt: g('Starts date') + ' ' + g('Starts time'),
      reminderTriggerNowReads: (names.find((n) => /^Reminder/.test(n)) || '').replace(/^Reminder\s*/, ''),
      hasScheduleButton: names.some((n) => /^Schedule meeting$/.test(n)),
    };
  });
  out.asserted.firstMeeting = { title: titleA, reminder: remA, requestBody: posted[0] };
  out.asserted.pickedFromMenu = picked;

  if (!out.asserted.formOpen || out.asserted.reminderTriggerNowReads !== '5 minutes before'
      || !out.asserted.hasScheduleButton) {
    out.leftToDo = 'The second form is not showing "5 minutes before" as its Reminder — do not judge '
                 + 'this screen. Choose it by hand from the Reminder control and follow the steps.';
    return out;
  }
  progress(2);

  out.ready = true;
  out.stepsDone = 2;   // both meetings set up; waiting for the reminders is step 3
  out.leftToDo = `One meeting is already scheduled with "No reminder" (${titleA}), starting in about `
               + `12 minutes. The form now in front of you is the second one (${titleB}), starting in `
               + `about 11 minutes, with Reminder set to "5 minutes before". Open the Network tab, press `
               + `Schedule meeting, and read the body of POST /api/v1/calendar/meetings — then watch the `
               + `notifications bell over the next ten minutes and see which reminders arrive for each `
               + `of the two meetings. The first one's request body was:\n  ${posted[0]}`;
  return out;
};
