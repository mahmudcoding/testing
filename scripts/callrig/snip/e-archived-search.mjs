/* Repro: search silently drops everything that lives in an archived channel.
 * Report: lane E, "[FE-WEB][SEARCH] Поиск молча пропускает всё, что лежит в архивном канале"
 *
 * Makes a channel whose name carries a rare word, posts a message with the same word,
 * archives it, waits until the server's own search returns both, then types that word
 * into Global search — you compare the two.
 */
import { DOM } from './lib.mjs';
const WS = 'W4QEF1XTURESO01', CO = 'O4QEF1XTURESO01';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const word = 'kruvaz' + Date.now().toString(36).slice(-5);

  await page.goto(`https://airion-cargo.store/w/${WS}/chat/saved`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // step 1 — a channel with a message carrying a rare word, then archive it
  const setup = await page.evaluate(async ({ ws, w }) => {
    const cr = await fetch('/api/v1/channels', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: ws, name: 'e-arch-' + w, type: 'public' }),
    });
    const cj = await cr.json().catch(() => ({}));
    const id = cj.id || (cj.channel && cj.channel.id);
    if (!id) return { crStatus: cr.status, id: null };
    // the channel is not immediately postable — a message straight after create returns 400
    await new Promise((r) => setTimeout(r, 2500));
    const mr = await fetch('/api/v1/messaging/messages', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: id, body: 'archived search marker ' + w }),
    });
    await new Promise((r) => setTimeout(r, 2000));
    const ar = await fetch(`/api/v1/channels/${id}/archive`, { method: 'POST', credentials: 'include' });
    const aj = await ar.json().catch(() => ({}));
    return { crStatus: cr.status, id, name: cj.name || 'e-arch-' + w, msgStatus: mr.status,
      archiveStatus: ar.status, is_archived: aj.is_archived };
  }, { ws: WS, w: word });

  if (!setup.id || setup.msgStatus !== 200 || setup.is_archived !== true) {
    out.asserted = setup;
    out.leftToDo = 'Could not build an archived channel holding the marker message — do not judge '
                 + 'this screen. Do it by hand and follow the steps.';
    return out;
  }

  // wait until the SERVER's own search can see it, so an empty screen cannot be blamed on indexing
  let api = null;
  for (let i = 0; i < 14; i++) {
    api = await page.evaluate(async ({ w, co, ws }) => {
      const r = await fetch(`/api/v1/search?q=${w}&company_id=${co}&workspace_id=${ws}&limit=25`,
        { credentials: 'include' });
      const t = await r.text();
      let j = {}; try { j = JSON.parse(t); } catch { /* keep the raw text */ }
      return { status: r.status, body: t.slice(0, 700),
        total_messages: j.total_messages, total_channels: j.total_channels };
    }, { w: word, co: CO, ws: WS });
    if (api && (api.total_messages > 0 || api.total_channels > 0)) break;
    await page.waitForTimeout(2500);
  }
  if (!api || (!api.total_messages && !api.total_channels)) {
    out.asserted = { setup, api };
    out.leftToDo = 'The server\'s own search never returned the marker, so there is nothing for the '
                 + 'screen to be missing — do not judge this. Re-run.';
    return out;
  }
  progress(1);

  // step 2 — Global search, from the sidebar search button
  await page.evaluate(DOM);
  await page.evaluate(() => window.__qa.clickDeepest(/^Search QA Workspace/));
  await page.waitForTimeout(1500);
  const inp = page.locator('[role=dialog] input').first();
  if (!(await inp.count())) {
    out.leftToDo = 'Global search did not open — do not judge this. Open it by hand and type the word.';
    return out;
  }
  await inp.click();
  await inp.fill(word);
  await page.waitForTimeout(5000);
  await page.evaluate(DOM);

  out.asserted = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter((x) => window.__qa.boxVis(x)).pop();
    if (!d) return { dialogOpen: false };
    const names = [...d.querySelectorAll('button')].filter((b) => window.__qa.boxVis(b))
      .map((b) => window.__qa.nameOf(b));
    return {
      dialogOpen: true,
      tabCounters: names.filter((n) => /^(All|Messages|Channels|People|Files)\d/.test(n)),
      screenText: d.innerText.replace(/\n+/g, ' | ').slice(0, 260),
    };
  });
  out.asserted.word = word;
  out.asserted.archivedChannel = setup.name + ' (' + setup.id + ', is_archived ' + setup.is_archived + ')';
  out.asserted.serverSearchForTheSameWord = api;

  if (!out.asserted.dialogOpen || !out.asserted.tabCounters.length) {
    out.leftToDo = 'The search dialog is not showing its tab counters — do not judge this screen.';
    return out;
  }
  progress(2);

  out.ready = true;
  out.stepsDone = 2;   // steps 1-2 done; the comparison is step 3
  out.leftToDo = `A public channel named "e-arch-${word}" was created, given a message containing `
               + `"${word}", and archived. Global search now holds that word. Read the Messages and `
               + `Channels tab counters and the result list, then compare them with what the server `
               + `returned for the same query a second earlier:\n  ${api.body}`;
  return out;
};
