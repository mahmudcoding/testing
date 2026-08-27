/* Repro: closing search drops focus at the top of the page instead of on the button that
 * opened it.
 * Report: lane E, "[FE-WEB][SHELL] После закрытия поиска фокус уходит в начало страницы…"
 *
 * Opens Global search from the sidebar search button and stops — you press Escape, then Tab.
 */
import { DOM } from './lib.mjs';
const WS = 'W4QEF1XTURESO01', GEN = 'C4QEGENERAL0001';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.evaluate(DOM);

  // step 1 — open Global search with the sidebar search button
  const opened = await page.evaluate(() => window.__qa.clickDeepest(/^Search QA Workspace/));
  await page.waitForTimeout(2000);
  await page.evaluate(DOM);

  out.asserted = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
    const a = document.activeElement;
    const opener = [...document.querySelectorAll('button')]
      .find((b) => /^Search QA Workspace/.test(window.__qa.nameOf(b)));
    return {
      url: location.href,
      searchDialogOpen: !!d && /Global search/.test(d.innerText),
      focusNow: { tag: a.tagName, name: (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 45) },
      openerStillInThePage: !!opener,
      openerName: opener ? window.__qa.nameOf(opener).slice(0, 40) : null,
      bellPresentForComparison: [...document.querySelectorAll('button')]
        .some((b) => /^Notifications,/.test(window.__qa.nameOf(b))),
    };
  });
  out.asserted.openerClick = { ok: opened.ok, name: opened.name };

  if (!out.asserted.searchDialogOpen || out.asserted.focusNow.tag !== 'INPUT'
      || !out.asserted.openerStillInThePage) {
    out.leftToDo = 'Global search is not open with the cursor in its box — do not judge this screen. '
                 + 'Open it from the sidebar search button by hand and follow the steps.';
    return out;
  }
  progress(1);

  out.ready = true;
  out.stepsDone = 1;   // step 1 done; closing it and pressing Tab are steps 2-3
  out.leftToDo = 'Global search is open, opened from the sidebar search button, and the cursor is in '
               + 'its box. Do not type. Press Escape to close it, then press Tab once and see which '
               + 'control the focus ring lands on. Then do the same with the notifications bell — open '
               + 'it, press Escape, press Tab — and compare.';
  return out;
};
