/* Does "Add to call" -> pick a workspace member -> Invite actually reach that member?
 * Host starts a call, the member is parked outside it, and the member's whole
 * document is polled from BEFORE the click until well after.
 *   ./d a:alice snip/a-inv-member.mjs
 */
import { DOM } from './lib.mjs';
import { attach, ensureCall, inCall, tile, HOST, WS, NAME } from './a-callkit.mjs';

const WHO = process.env.QA_WHO || NAME.bob;

// installed on the observer: records every distinct visible-text state, uncapped,
// reduced in-page to the notice-shaped nodes so the return value stays small.
const WATCH = `(() => {
  window.__seen = []; window.__n = 0;
  const t0 = Date.now();
  const snap = () => {
    window.__n++;
    const hits = [...document.querySelectorAll('body *')]
      .filter((e) => !e.children.length)
      .filter((e) => window.__qa.vis(e))
      .map((e) => (e.innerText || '').replace(/\\s+/g, ' ').trim())
      .filter((s) => s && s.length < 120)
      .filter((s) => /call|invit|join|decline|accept|ring|QA /i.test(s));
    const key = hits.sort().join(' | ');
    const prev = window.__seen.length ? window.__seen[window.__seen.length - 1].key : null;
    if (key !== prev) window.__seen.push({
      ms: Date.now() - t0, key,
      vis: document.visibilityState, url: location.pathname,
    });
  };
  snap();
  window.__iv = setInterval(snap, 300);
})()`;

export default async ({ page, ctx, browser }) => {
  const out = { steps: [] };
  const host = { page, ctx, browser };

  const call = await ensureCall(page);
  out.call = call;
  if (!call.id) return out;

  const obs = await attach(process.env.QA_WHOACC || 'bob');
  await tile(host, 0, 2); await tile(obs, 1, 2);

  // the observer must be OUTSIDE the call, on an ordinary workspace page
  if (await inCall(obs.page)) { out.err = 'observer is already in the call'; return out; }
  await obs.page.goto(`${HOST}/w/${WS}/directories`, { waitUntil: 'domcontentloaded' });
  await obs.page.waitForTimeout(4000);
  await obs.page.evaluate(DOM);
  await obs.page.evaluate(WATCH);
  out.steps.push('observer parked + watcher armed');

  // capture the invite request from the host side
  const reqs = [];
  page.on('response', async (r) => {
    if (!/\/invite/.test(r.url())) return;
    let body = null;
    try { body = (await r.text()).slice(0, 300); } catch {}
    reqs.push({ m: r.request().method(), u: r.url().replace(/https:\/\/[^/]+/, ''),
                s: r.status(), post: r.request().postData(), body });
  });

  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(400);
  await page.evaluate(DOM);
  const opened = await page.evaluate(() => window.__qa.clickDeepest(/^Add to call$/));
  out.openedDialog = opened;
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);

  const dlg = () => page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter((x) => x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    if (!d) return null;
    return {
      text: (d.innerText || '').replace(/\s+/g, ' ').slice(0, 500),
      ctl: [...d.querySelectorAll('button,li,[role=option],[role=checkbox],input')]
        .filter(window.__qa.boxVis)
        .map((n) => ({
          t: (n.innerText || window.__qa.nameOf(n) || '').replace(/\s+/g, ' ').trim().slice(0, 50),
          tag: n.tagName,
          dis: n.disabled === true || n.getAttribute('aria-disabled') === 'true',
          sel: n.getAttribute('data-selected') ?? n.getAttribute('aria-checked'),
          tid: n.getAttribute('data-testid'),
        })).filter((r) => r.t || r.tid),
    };
  });
  out.dialogBefore = await dlg();

  // pick the member
  const pick = await page.evaluate((w) => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter((x) => x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    if (!d) return null;
    // the member rows are INPUTs, not buttons — enumerate what is interactive,
    // not what the markup was expected to be, and take the SMALLEST node that
    // carries the name so we click one row and not the whole list.
    const cands = [...d.querySelectorAll('button,li,[role=option],[role=checkbox],input,label')]
      .filter(window.__qa.boxVis)
      .filter((n) => {
        const t = (n.innerText || '') + ' ' + (window.__qa.nameOf(n) || '') + ' ' +
                  (n.getAttribute('aria-label') || '');
        return t.includes(w);
      })
      .sort((a, b) => {
        const L = (n) => ((n.innerText || '') + (window.__qa.nameOf(n) || '')).length;
        return L(a) - L(b);
      });
    const c = cands[0];
    if (!c) return { found: false, saw: [...d.querySelectorAll('input')].length };
    c.scrollIntoView({ block: 'center' });
    const r = c.getBoundingClientRect();
    return { found: true, x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2),
             tag: c.tagName, type: c.type || null, cands: cands.length,
             t: ((c.innerText || '') || window.__qa.nameOf(c) || '').replace(/\s+/g, ' ').slice(0, 60) };
  }, WHO);
  out.pick = pick;
  if (pick && pick.found) { await page.mouse.click(pick.x, pick.y); await page.waitForTimeout(1500); }
  await page.evaluate(DOM);
  out.dialogAfterPick = await dlg();

  // send
  const sent = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter((x) => x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    return window.__qa.clickDeepest(/^Invite/, d);
  });
  out.clickedInvite = sent;

  // host-side notice, polled from now
  const t0 = Date.now();
  const hostNotices = [];
  for (let i = 0; i < 34; i++) {
    await page.waitForTimeout(300);
    const n = await page.evaluate(() => window.__qa.notices());
    for (const x of (n || [])) {
      const k = (x.text || '').replace(/\s+/g, ' ').trim();
      if (k && !hostNotices.some((h) => h.text === k)) hostNotices.push({ ms: Date.now() - performance.timeOrigin, text: k });
    }
  }
  out.hostNotices = hostNotices.map((h, i) => ({ i, text: h.text.slice(0, 90) }));
  out.invite = reqs;

  // let the observer's watcher run out to ~35 s total
  const spent = Date.now() - t0;
  if (spent < 35000) await obs.page.waitForTimeout(35000 - spent);
  out.observer = await obs.page.evaluate(() => {
    clearInterval(window.__iv);
    return { samples: window.__n, states: window.__seen.map((s) => ({
      ms: s.ms, vis: s.vis, url: s.url, key: s.key.slice(0, 300) })) };
  });
  out.observerInCall = await inCall(obs.page);
  return out;
};
