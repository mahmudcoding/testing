/* Second half of the flow: the invitee presses Accept. Does the member get in?
 *   ./d a:alice snip/a-inv-accept.mjs
 */
import { DOM } from './lib.mjs';
import { attach, ensureCall, inCall, admitAll, tile, HOST, WS, NAME } from './a-callkit.mjs';

export default async ({ page, ctx, browser }) => {
  const out = {};
  const host = { page, ctx, browser };
  const call = await ensureCall(page);
  out.call = call;
  if (!call.id) return out;

  const obs = await attach('bob');
  await tile(host, 0, 2); await tile(obs, 1, 2);
  if (await inCall(obs.page)) { out.note = 'observer already in call — nothing to test'; return out; }
  await obs.page.goto(`${HOST}/w/${WS}/directories`, { waitUntil: 'domcontentloaded' });
  await obs.page.waitForTimeout(4000);

  // observer records every request it makes while accepting
  const obsReqs = [];
  obs.page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\/(meeting|meetings)/.test(u)) return;
    let body = null;
    try { if (r.status() >= 400) body = (await r.text()).slice(0, 300); } catch {}
    obsReqs.push({ m: r.request().method(), u: u.replace(/https:\/\/[^/]+/, ''), s: r.status(),
                   post: (r.request().postData() || '').slice(0, 160), body });
  });

  // host invites
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(DOM);
  await page.evaluate(() => window.__qa.clickDeepest(/^Add to call$/));
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  out.picked = await page.evaluate((w) => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter((x) => x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    const c = [...d.querySelectorAll('input')].filter(window.__qa.boxVis)
      .filter((n) => ((n.innerText || '') + (window.__qa.nameOf(n) || '')).includes(w) && !n.disabled)[0];
    if (!c) return null;
    c.click();
    return { clicked: (window.__qa.nameOf(c) || '').slice(0, 40) };
  }, NAME.bob);
  await page.waitForTimeout(1200);
  out.sent = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter((x) => x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    return window.__qa.clickDeepest(/^Invite/, d);
  });

  // observer waits for the banner, then presses Accept — proving the click landed
  await obs.page.evaluate(DOM);
  let accepted = null, sawBanner = null;
  for (let i = 0; i < 40; i++) {
    await obs.page.waitForTimeout(500);
    await obs.page.evaluate(DOM);
    const s = await obs.page.evaluate(() =>
      [...document.querySelectorAll('body *')].filter((e) => !e.children.length)
        .filter(window.__qa.vis).map((e) => (e.innerText || '').trim())
        .some((t) => /is calling/i.test(t)));
    if (s) { sawBanner = i * 500; break; }
  }
  out.bannerAtMs = sawBanner;
  if (sawBanner !== null) {
    accepted = await obs.page.evaluate(() => window.__qa.clickDeepest(/^Accept$/));
  }
  out.acceptClick = accepted;

  // where did the observer end up?
  const trail = [];
  for (let i = 0; i < 24; i++) {
    await obs.page.waitForTimeout(1000);
    trail.push({ s: i + 1, url: obs.page.url().replace(/https:\/\/[^/]+/, '') });
    if (i === 6) await admitAll(page);            // host lets them out of the lobby if needed
  }
  const seen = [];
  for (const t of trail) if (!seen.length || seen[seen.length - 1].url !== t.url) seen.push(t);
  out.observerUrlTrail = seen;
  out.observerInCall = await inCall(obs.page);
  await obs.page.evaluate(DOM);
  out.observerScreen = await obs.page.evaluate(() =>
    [...document.querySelectorAll('body *')].filter((e) => !e.children.length)
      .filter(window.__qa.vis).map((e) => (e.innerText || '').replace(/\s+/g, ' ').trim())
      .filter((t) => t && t.length < 90).slice(0, 40));
  out.observerReqs = obsReqs;
  return out;
};
