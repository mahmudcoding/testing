/* Repro: search displays an active channel filter it never applied.
 * Report: lane E, "[FE-WEB][SEARCH] Поиск показывает активный фильтр канала, которого не применял"
 *
 * Opens Global search and types ":in #<a public channel this account is not a member of> <word>" —
 * you read the chip above the results and the channels the results actually come from.
 */
import { DOM } from './lib.mjs';
const WS = 'W4QEF1XTURESO01';
const OUTSIDE = 'qa-empty';                        // public, and this account is not in it
const QUERY = ':in #' + OUTSIDE + ' marker';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const net = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/v1/search')) net.push(r.url().replace(/^https?:\/\/[^/]+/, ''));
  });

  await page.goto(`https://airion-cargo.store/w/${WS}/chat/saved`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.evaluate(DOM);

  const myChannels = await page.evaluate(async (ws) => {
    const j = await (await fetch(`/api/v1/workspaces/${ws}/channels`, { credentials: 'include' })).json();
    return (j.channels || j.data || []).map((c) => c.name);
  }, WS);
  if (myChannels.includes(OUTSIDE)) {
    out.asserted = { myChannels };
    out.leftToDo = `This account turns out to be a member of #${OUTSIDE}, so the finding's `
                 + 'precondition is not met — do not judge this screen. Pick a public channel you '
                 + 'are not in, or simply mistype a channel name, and follow the steps.';
    return out;
  }

  // step 1 — Global search, typed filter naming that channel
  await page.evaluate(() => window.__qa.clickDeepest(/^Search QA Workspace/));
  await page.waitForTimeout(1500);
  const inp = page.locator('[role=dialog] input').first();
  if (!(await inp.count())) {
    out.leftToDo = 'Global search did not open — do not judge this. Open it by hand and type the filter.';
    return out;
  }
  await inp.click();
  await inp.fill(QUERY);
  await page.waitForTimeout(4500);
  await page.evaluate(DOM);

  out.asserted = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
    if (!d) return { dialogOpen: false };
    const names = [...d.querySelectorAll('button')].filter((b) => window.__qa.boxVis(b))
      .map((b) => window.__qa.nameOf(b));
    return {
      dialogOpen: true,
      filterChips: names.filter((n) => /^Remove .* filter$/.test(n)),
      counts: names.filter((n) => /^(All|Messages|Channels|People|Files)\d/.test(n)),
      // NB: the dialog's own hint line says "…like :in #general", so #general appears here
      // whatever the results are. Read the result rows on screen, not this list alone.
      channelsNamedAnywhereInDialog: [...new Set((d.innerText.match(/#[a-z0-9-]+/g) || []))].slice(0, 8),
      boxAfterParse: (d.querySelector('input') || {}).value || null,
    };
  });
  out.asserted.typedIntoBox = QUERY;
  out.asserted.notAMemberOf = OUTSIDE;
  out.asserted.myChannels = myChannels;
  out.asserted.searchRequests = net.slice();

  if (!out.asserted.dialogOpen || out.asserted.filterChips.length !== 1) {
    out.leftToDo = 'The dialog did not end up with exactly one filter chip — do not judge this '
                 + 'screen. Type the filter by hand and follow the steps.';
    return out;
  }
  progress(1);

  out.ready = true;
  out.stepsDone = 1;   // step 1 done; reading the chip and the results is step 2
  out.leftToDo = `"${QUERY}" was typed into Global search. This account is a member of `
               + `${myChannels.map((c) => '#' + c).join(', ')} — not of #${OUTSIDE}. Read the filter `
               + `chip above the results, then read which channels the results themselves come from. `
               + `The same input naming a channel you ARE in (":in #qa-general marker") is the `
               + `control, and a plain typo (":in #nosuchchan marker") behaves like the case above.`;
  return out;
};
