/* Repro: touching the search dialog's sort control kills keyboard navigation inside it.
 * Report: lane E, "[FE-WEB][SEARCH] Любое обращение к контролам диалога поиска выключает…"
 *
 * Shows the keyboard path working first (arrow keys + Enter open a result), then comes back,
 * retypes and changes the sort to Date — you press the arrows and Enter again.
 *
 * NOTE for the judge: on this build only the SORT control does it. Clicking the Messages tab
 * or the Last 30 days range leaves the arrows and Enter working.
 */
import { DOM } from './lib.mjs';
const WS = 'W4QEF1XTURESO01', QUERY = 'marker';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  const state = () => page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
    const inp = d ? d.querySelector('input') : null;
    const names = d ? [...d.querySelectorAll('button')].filter((b) => window.__qa.boxVis(b))
      .map((b) => window.__qa.nameOf(b)) : [];
    return {
      dialogOpen: !!d,
      selectedRow: inp ? inp.getAttribute('aria-activedescendant') : null,
      focus: (document.activeElement.getAttribute('aria-label')
        || document.activeElement.textContent || document.activeElement.tagName).trim().slice(0, 32),
      counts: names.filter((n) => /^(All|Messages|Channels|People|Files)\d/.test(n)),
      sortTrigger: names.find((n) => /^(Relevance|Date)$/.test(n)) || null,
      path: location.pathname + location.search,
    };
  });

  const openSearch = async () => {
    await page.goto(`https://airion-cargo.store/w/${WS}/chat/saved`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3200);
    await page.evaluate(DOM);
    await page.evaluate(() => window.__qa.clickDeepest(/^Search QA Workspace/));
    await page.waitForTimeout(1500);
    const inp = page.locator('[role=dialog] input').first();
    if (!(await inp.count())) return false;
    await inp.click(); await inp.fill(QUERY);
    await page.waitForTimeout(4500);
    await page.evaluate(DOM);
    return true;
  };

  // step 1 — a query with results
  if (!(await openSearch())) {
    out.leftToDo = 'Global search did not open — do not judge this. Open it by hand and follow the steps.';
    return out;
  }
  const withResults = await state();
  if (!withResults.counts.some((c) => /[1-9]/.test(c))) {
    out.asserted = { withResults };
    out.leftToDo = `"${QUERY}" returned nothing, so there is no list to navigate — do not judge this `
                 + 'screen. Type a word that has results and follow the steps.';
    return out;
  }
  progress(1);

  // step 2 — arrows and Enter, untouched: this is the control, and it navigates away
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(500);
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(500);
  const beforeEnter = await state();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const afterEnter = await state();
  const keyboardWorksUntouched = beforeEnter.selectedRow !== withResults.selectedRow
    && !afterEnter.dialogOpen && afterEnter.path !== withResults.path;
  if (!keyboardWorksUntouched) {
    out.asserted = { withResults, beforeEnter, afterEnter };
    out.leftToDo = 'Arrow keys and Enter did not work even before touching a control, so the control '
                 + 'this finding rests on is missing — do not judge this screen.';
    return out;
  }
  progress(2);

  // step 3 — same query again, then change the sort to Date
  if (!(await openSearch())) {
    out.leftToDo = 'Global search did not reopen — do not judge this. Follow the steps by hand.';
    return out;
  }
  await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
    window.__qa.clickDeepest(/^Relevance$/, d);
  });
  await page.waitForTimeout(1600);
  await page.evaluate(DOM);
  const picked = await page.evaluate(() => window.__qa.popperPick(/^Date$/));
  await page.waitForTimeout(3000);
  await page.evaluate(DOM);

  out.asserted = await state();
  out.asserted.keyboardBeforeAnyControl = {
    rowAtOpen: withResults.selectedRow, rowAfterTwoArrows: beforeEnter.selectedRow,
    afterEnter: { dialogOpen: afterEnter.dialogOpen, wentTo: afterEnter.path },
  };
  out.asserted.sortPicked = picked;

  if (!out.asserted.dialogOpen || out.asserted.sortTrigger !== 'Date'
      || !out.asserted.counts.some((c) => /[1-9]/.test(c))) {
    out.leftToDo = 'The dialog is not showing results sorted by Date — do not judge this screen. '
                 + 'Set the sort by hand and follow the steps.';
    return out;
  }
  progress(3);

  out.ready = true;
  out.stepsDone = 3;   // steps 1-3 done; the arrows and Enter are step 4
  out.leftToDo = `Global search holds "${QUERY}" with results, and the sort has just been changed `
               + `from Relevance to Date. A moment ago, before any control was touched, two arrow `
               + `presses moved the selection from ${withResults.selectedRow} to `
               + `${beforeEnter.selectedRow} and Enter opened the result at ${afterEnter.path} — that `
               + `is the control. Now press the down arrow a few times, then Enter, then click the `
               + `same row with the mouse. (On this build the Messages tab and the Last 30 days range `
               + `no longer do this — only the sort control.)`;
  return out;
};
