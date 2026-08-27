/* Repro: changing the start date leaves the summary line and the end date on the old day.
 * Report: lane E, "[FE-WEB][CALENDAR] После смены даты начала сводка и поле окончания остаются…"
 *
 * Opens New meeting and changes only the start date, ten days out — you read the summary line
 * and the end date field.
 */
import { DOM } from './lib.mjs';
const WS = 'W4QEF1XTURESO01';

const form = (page) => page.evaluate(() => {
  const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
  if (!d) return null;
  const g = (l) => { const i = d.querySelector(`input[aria-label="${l}"]`); return i ? i.value : null; };
  const t = d.innerText.replace(/\n+/g, ' | ');
  return {
    startsDate: g('Starts date'), startsTime: g('Starts time'),
    endsDate: g('Ends date'), endsTime: g('Ends time'),
    summaryLine: (t.match(/[A-Z][a-z]{2}, [A-Z][a-z]{2} \d+[^|]*/) || [''])[0].trim().slice(0, 70),
  };
});

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // step 1 — Calendar -> New meeting
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.evaluate(DOM);
  await page.evaluate(() => window.__qa.clickDeepest(/^New meeting$/));
  await page.waitForTimeout(2800);
  await page.evaluate(DOM);
  const before = await form(page);
  if (!before || !before.startsDate) {
    out.leftToDo = 'The New meeting form did not open — do not judge this. Open it by hand.';
    return out;
  }
  progress(1);

  // step 2 — change ONLY the start date, ten days out
  const target = await page.evaluate(() => new Date(Date.now() + 10 * 864e5).toISOString().slice(0, 10));
  const sd = page.locator('[role=dialog] input[aria-label="Starts date"]').first();
  await sd.click();
  await sd.fill(target);
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);

  const after = await form(page);
  out.asserted = {
    url: page.url(),
    formAsOpened: before,
    startDateChangedTo: target,
    formNow: after,
    onlyTheStartDateWasTouched: true,
  };
  if (!after || after.startsDate !== target || after.startsTime !== before.startsTime) {
    out.leftToDo = 'The start date did not take, or something else changed with it — do not judge '
                 + 'this screen. Change it by hand and follow the steps.';
    return out;
  }
  progress(2);

  out.ready = true;
  out.stepsDone = 2;   // steps 1-2 done; reading the summary and the end field is step 3
  out.leftToDo = `The start date has been changed from ${before.startsDate} to ${target}, and nothing `
               + `else was touched. Read the summary line at the bottom of the form and the end date `
               + `field. Then, as a control, change the start TIME and watch what the summary and the `
               + `end date do. Pressing Schedule meeting afterwards is worth doing too — check which `
               + `day the meeting actually lands on in the grid.`;
  return out;
};
