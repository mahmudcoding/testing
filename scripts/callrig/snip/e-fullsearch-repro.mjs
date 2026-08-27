/* Repro: "Open full search" narrows the search to the current channel and shows zero results.
 * Report: lane E, "[FE-WEB][SEARCH] Open full search сужает поиск до текущего канала…"
 * Posts a unique word into #qa-private, stands you in #qa-general with the Global search
 * dialog open and that word found — you press Open full search. */
import { DOM } from './lib.mjs';
const WS = 'W4QEF1XTURESO01', GEN = 'C4QEGENERAL0001', PRIV = 'C4QEPRIVATE0001';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const word = 'zorvex' + Date.now().toString(36).slice(-5);
  const net = [];
  page.on('request', r => {
    if (r.url().includes('/api/v1/search')) net.push(r.url().replace(/^https?:\/\/[^/]+/, ''));
  });

  // step 1 — the unique word goes into the OTHER channel (#qa-private)
  const post = await page.evaluate(async ({ w, ch }) => {
    const r = await fetch('/api/v1/messaging/messages', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: ch, body: 'repro marker ' + w }),
    });
    return r.status;
  }, { w: word, ch: PRIV });
  if (post !== 200 && post !== 201) {
    out.leftToDo = `Could not post the marker message (HTTP ${post}) — do not judge this screen. `
                 + 'Send a message with a unique word into #qa-private by hand and follow the steps.';
    return out;
  }
  progress(1);

  // step 2 — stand in the OTHER channel (#qa-general) and open the sidebar search
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.evaluate(DOM);
  const opened = await page.evaluate(() => window.__qa.clickDeepest(/^Search QA Workspace/));
  await page.waitForTimeout(1500);
  const inp = page.locator('[role=dialog] input').first();
  if (!(await inp.count())) {
    out.leftToDo = 'Global search did not open — do not judge this. Open it from the sidebar search '
                 + 'button by hand while standing in #qa-general.';
    return out;
  }
  progress(2);

  // step 3 — type the word; the dialog must find it and name #qa-private
  await inp.click();
  await inp.fill(word);
  await page.waitForTimeout(4500);
  await page.evaluate(DOM);

  out.asserted = await page.evaluate((w) => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(x => window.__qa.boxVis(x)).pop();
    const txt = d ? d.innerText.replace(/\n+/g, ' | ') : '';
    const counts = {};
    for (const k of ['All', 'Messages', 'Channels', 'People', 'Files']) {
      const b = [...(d || document).querySelectorAll('button')]
        .find(x => new RegExp('^' + k + '\\d').test(window.__qa.nameOf(x)));
      counts[k] = b ? window.__qa.nameOf(b).replace(k, '') : null;
    }
    return {
      url: location.href,
      standingIn: '#qa-general (' + location.pathname.split('/c/')[1] + ')',
      word: w,
      dialogOpen: !!d,
      resultNamesOtherChannel: /#qa-private/.test(txt),
      counts,
      hasOpenFullSearch: [...(d || document).querySelectorAll('button')]
        .some(x => /^Open full search$/.test(window.__qa.nameOf(x))),
      requestsSoFar: [],
    };
  }, word);
  out.asserted.requestsSoFar = net.slice();

  if (!out.asserted.dialogOpen || !out.asserted.resultNamesOtherChannel
      || !out.asserted.hasOpenFullSearch) {
    out.leftToDo = 'The dialog did not reach the state this finding needs (one result, in #qa-private, '
                 + 'with an Open full search button) — do not judge this screen. Re-run, or follow the '
                 + 'written steps by hand.';
    return out;
  }
  progress(3);

  out.ready = true;
  out.stepsDone = 3;   // steps 1-3 done; pressing Open full search is step 4
  out.leftToDo = `You are standing in #qa-general. Global search has found "${word}" — one result, `
               + 'and the row names #qa-private. Press Open full search at the bottom of the dialog, '
               + 'then read the counters and the URL on the page it opens.';
  return out;
};
