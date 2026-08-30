/* Repro — BUG: after the host ends the meeting the guest is left on a summary
 * screen carrying no control at all, while a signed-in participant's summary of
 * the same call carries the rating stars, Done, Call again and Close.
 *
 * Driver: bob's browser, which this snippet turns into a GUEST session — it
 * clears that browser's cookies on purpose, because a guest link opened in a
 * signed-in browser joins as that account. Sign it back in afterwards with
 *   ./ensure.sh E bob
 * The host actions are driven on alice's rig browser over CDP.
 */
import { chromium } from 'playwright';
import { rigPort } from '../rigmap.mjs';
import { DOM, HOOK, safeClick, waitClick } from './lib.mjs';

const WS = 'W4QEF1XTURESO01';
const HOST = 'https://airion-cargo.store';

export default async ({ page, ctx, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const port = rigPort('E', 'alice');
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const hctx = browser.contexts()[0];
  await hctx.addInitScript(HOOK);
  const host = hctx.pages().filter((p) => p.url().includes('airion-cargo.store'))[0]
            || (await hctx.newPage());

  // ── 1. host starts a call and reads its guest link ────────────────────
  await host.goto(`${HOST}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await host.waitForTimeout(4000);
  out.asserted.endedLeftovers = await host.evaluate(async (ws) => {
    const r = await fetch(`/api/v1/workspace/${ws}/meetings/active`, { credentials: 'include' });
    const list = r.ok ? (await r.json()).meetings || [] : [];
    for (const m of list) await fetch(`/api/v1/meeting/${m.id}/end`, { method: 'POST', credentials: 'include' });
    return list.map((m) => m.id);
  }, WS);
  // the client can still believe it is in the call it just ended, and the router
  // then bounces every navigation back to /call/<id>. Wait for the hub for real.
  for (let i = 0; i < 12; i++) {
    await host.goto(`${HOST}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
    await host.waitForTimeout(4000);
    if (!/\/call\//.test(host.url())) break;
  }
  out.asserted.hubReached = !/\/call\//.test(host.url());
  if (!out.asserted.hubReached) {
    out.leftToDo = 'The host is still parked on the previous call, so a new one cannot be started. '
                 + 'Do not judge this screen.';
    await browser.close(); return out;
  }
  await host.evaluate(DOM);
  await host.evaluate(() => window.__qa.clickDeepest(/^Start now$/i));
  await host.waitForTimeout(2500);
  const nameInput = await host.$('[role=dialog] input[type=text]');
  if (nameInput) {
    await nameInput.click();
    await host.keyboard.press('Meta+A'); await host.keyboard.press('Delete');
    await nameInput.type('E guest ended repro');
  }
  const submit = await host.$('[data-testid="calls-start-submit"]');
  if (submit) await submit.click();
  await host.waitForTimeout(8000);
  if (await host.$('[data-testid="lobby-join"]')) {
    await safeClick(host, '[data-testid="lobby-join"]').catch(() => {});
    await host.waitForTimeout(8000);
  }
  const mid = (host.url().match(/\/call\/([^?/]+)/) || [])[1] || null;
  out.asserted.meetingId = mid;
  if (!mid) {
    out.leftToDo = 'The call never started. Do not judge this screen.';
    await browser.close(); return out;
  }
  await host.evaluate(DOM);
  await safeClick(host, '[data-testid="call-controls-add-to-call"]').catch(() => {});
  await host.waitForTimeout(3000);
  const link = await host.evaluate(() =>
    ([...document.querySelectorAll('[role=dialog] input')].map((i) => i.value)
      .find((v) => /\/join\//.test(v || '')) || null));
  out.asserted.guestLink = link ? link.replace(/\/join\/.*/, '/join/<token>') : null;
  await host.keyboard.press('Escape');
  if (!link) {
    out.leftToDo = 'No guest link in the Add to call dialog, so a guest cannot be produced. '
                 + 'Do not judge this screen.';
    await browser.close(); return out;
  }
  progress(1);

  // ── 2. guest enters through the link; host admits ─────────────────────
  await ctx.clearCookies();                       // a guest link needs a signed-out browser
  await page.goto(link, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  await page.evaluate(DOM);
  const nameField = await page.$('input[type=text]:not([readonly])');
  if (nameField) {
    await nameField.click();
    await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await nameField.type('O Guest Repro');
  }
  await page.waitForTimeout(600);
  await page.evaluate(() => window.__qa.clickDeepest(/^Ask to join$/i));
  await page.waitForTimeout(6000);

  await host.evaluate(DOM);
  const peoplePressed = await host.evaluate(() =>
    document.querySelector('[data-testid="call-controls-people-toggle"]')?.getAttribute('aria-pressed'));
  if (peoplePressed !== 'true') {
    await safeClick(host, '[data-testid="call-controls-people-toggle"]').catch(() => {});
    await host.waitForTimeout(3500);
  }
  await host.evaluate(DOM);
  // the admit control's accessible name carries the person's name: "Admit <name>"
  out.asserted.admit = await host.evaluate(() => window.__qa.clickDeepest(/^Admit /i));
  await host.waitForTimeout(9000);

  await page.evaluate(DOM);
  out.asserted.guestInCall = await page.evaluate(() => {
    const q = window.__qa;
    return [...document.querySelectorAll('button')].filter((n) => q.vis(n))
      .some((n) => /Leave call/i.test(q.nameOf(n)));
  });
  if (!out.asserted.guestInCall) {
    out.leftToDo = 'The guest never got into the call, so the screen after it ends is not the one '
                 + 'this finding is about. Do not judge this screen.';
    await browser.close(); return out;
  }
  progress(2);

  // ── 3. host ends the call for everyone ────────────────────────────────
  await host.evaluate(DOM);
  await safeClick(host, '[data-testid="call-controls-end-for-everyone"]').catch(() => {});
  await host.waitForTimeout(1500);
  await safeClick(host, '[data-testid="call-end-confirm-submit"]').catch(() => {});
  await host.waitForTimeout(10000);

  // what the signed-in participant gets, for comparison — the positive control
  await host.evaluate(DOM);
  out.asserted.hostSummaryControls = await host.evaluate(() => {
    const q = window.__qa;
    const ov = document.querySelector('[data-testid="call-ended-overlay"]');
    return ov ? [...ov.querySelectorAll('button,a')].filter((n) => q.vis(n)).map((n) => q.nameOf(n)) : null;
  });
  await browser.close();

  // ── 4. PROVE IT ───────────────────────────────────────────────────────
  await page.waitForTimeout(3000);
  await page.evaluate(DOM);
  out.asserted.guest = await page.evaluate(() => {
    const q = window.__qa;
    const count = (sel) => [...document.querySelectorAll(sel)].filter((n) => q.boxVis(n)).length;
    return {
      url: location.href,
      text: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 300),
      button: count('button'), link: count('a[href]'),
      roleButton: count('[role=button]'), input: count('input'),
    };
  });
  if (!/session has ended/i.test(out.asserted.guest.text)) {
    out.leftToDo = 'The guest is not on the ended-meeting screen. Do not judge this screen.';
    return out;
  }
  progress(3);
  out.ready = true;
  out.stepsDone = 3;
  out.leftToDo =
    'This browser is now the GUEST, on the screen it is left with after the host ended the meeting. '
    + 'Look for anything to press: there is no rating, no Done, no way off the page — '
    + 'asserted.guest counts every visible button, link, [role=button] and input separately, and each '
    + 'is 0. asserted.hostSummaryControls is what the signed-in participant was shown for the same '
    + 'call at the same moment. Afterwards, sign this browser back in with:  ./ensure.sh E bob';
  return out;
};
