/* Repro: ":@ <First Last> <word>" resolves to a different person, and the chip promises
 * a filter the request never carries.
 * Report: lane E, "[FE-WEB][SEARCH] :@ <Имя Фамилия> подставляет другого участника…"
 *
 * Opens Global search fresh and types the filter exactly as Directories prints the name —
 * you read the name in the chip above the results.
 */
import { DOM } from './lib.mjs';
const WS = 'W4QEF1XTURESO01', GEN = 'C4QEGENERAL0001';
const TYPED_NAME = 'QA Carol';                 // exactly as Directories -> People prints it
const QUERY = ':@ ' + TYPED_NAME + ' marker';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const net = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/v1/search')) net.push(r.url().replace(/^https?:\/\/[^/]+/, ''));
  });

  // A FRESH dialog every time: chips survive an edit of the query inside one open dialog,
  // so a reused dialog measures the previous query's filter as well as this one's.
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3200);
  await page.evaluate(DOM);
  await page.evaluate(() => window.__qa.clickDeepest(/^Search QA Workspace/));
  await page.waitForTimeout(1600);

  const inp = page.locator('[role=dialog] input').first();
  if (!(await inp.count())) {
    out.leftToDo = 'Global search did not open — do not judge this. Open it from the sidebar search '
                 + 'button and type the filter by hand.';
    return out;
  }
  await inp.click();
  await inp.fill(QUERY);
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);

  out.asserted = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
    if (!d) return { dialogOpen: false };
    const names = [...d.querySelectorAll('button')].filter((b) => window.__qa.boxVis(b))
      .map((b) => window.__qa.nameOf(b));
    return {
      dialogOpen: true,
      // the app consumes the ":@ …" prefix into a chip and leaves the rest in the box,
      // so the box no longer holds what was typed — record what it kept.
      boxAfterParse: (d.querySelector('input') || {}).value || null,
      filterChips: names.filter((n) => /^Remove .* filter$/.test(n)),
      counts: names.filter((n) => /^(All|Messages|Channels|People|Files)\d/.test(n)),
    };
  });
  out.asserted.typedName = TYPED_NAME;
  out.asserted.searchRequests = net.slice();

  out.asserted.typedIntoBox = QUERY;
  if (!out.asserted.dialogOpen || out.asserted.filterChips.length !== 1) {
    out.leftToDo = 'The dialog did not end up with the typed filter and a filter chip — do not judge '
                 + 'this screen. Type it by hand and follow the steps.';
    return out;
  }
  progress(1);

  out.ready = true;
  out.stepsDone = 1;   // step 1 done; reading the chip is step 2
  out.leftToDo = `"${QUERY}" was typed into Global search — the name copied exactly as `
               + `Directories -> People prints it. Read the person named in the filter chip above the `
               + `results and compare it with "${TYPED_NAME}" (the box itself now holds `
               + `"${out.asserted.boxAfterParse}"). Then, for the second half of the finding, retype the `
               + `filter naming someone you have no direct messages with — for example ":@ QA Dave marker" `
               + `— and compare the results with the same word typed on its own. A one-word name, `
               + `":@ Bob marker", resolves correctly and does narrow: that is the control.`;
  return out;
};
