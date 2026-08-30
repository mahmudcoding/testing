/* Repro — BUG: the call-ended summary credits a participant who left and rejoined
 * with the whole span between their first join and their last leave.
 *
 * Driver: alice (host). Reaches bob's lane-E browser over CDP.
 * Leaves the human on the ended summary, one action short of the comparison.
 */
import { chromium } from 'playwright';
import { rigPort } from '../rigmap.mjs';
import { DOM, HOOK, safeClick, waitClick } from './lib.mjs';

const WS = 'W4QEF1XTURESO01';
const HOST = 'https://airion-cargo.store';

async function attach(account) {
  const port = rigPort('E', account);
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const ctx = browser.contexts()[0];
  await ctx.addInitScript(HOOK);
  const all = ctx.pages().filter((p) => !p.url().startsWith('devtools://'));
  const on = all.filter((p) => p.url().includes('airion-cargo.store'));
  return { browser, page: on[0] || all[all.length - 1] || (await ctx.newPage()) };
}

const endAllActive = (page) => page.evaluate(async (ws) => {
  const r = await fetch(`/api/v1/workspace/${ws}/meetings/active`, { credentials: 'include' });
  const list = r.ok ? (await r.json()).meetings || [] : [];
  for (const m of list) await fetch(`/api/v1/meeting/${m.id}/end`, { method: 'POST', credentials: 'include' });
  return list.map((m) => m.id);
}, WS);

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const bob = await attach('bob');

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  // A meeting left active blocks the next call from ever starting.
  await page.goto(`${HOST}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  out.asserted.endedLeftovers = await endAllActive(page);
  await bob.page.goto(`${HOST}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  await page.evaluate(() => window.__qa.clickDeepest(/^Start now$/i));
  await page.waitForTimeout(2500);
  const nameInput = await page.$('[role=dialog] input[type=text]');
  if (nameInput) {
    await nameInput.click();
    await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await nameInput.type('E rejoin summary repro');
  }
  const open = await page.$('[role=dialog] input[value="open"]');   // no waiting room
  if (open) await open.click();
  await page.waitForTimeout(400);
  const submit = await page.$('[data-testid="calls-start-submit"]');
  if (submit) await submit.click();
  await page.waitForTimeout(8000);

  // the host may land in the pre-join lobby
  if (await page.$('[data-testid="lobby-join"]')) {
    await safeClick(page, '[data-testid="lobby-join"]').catch(() => {});
    await page.waitForTimeout(8000);
  }
  const mid = (page.url().match(/\/call\/([^?/]+)/) || [])[1] || null;
  out.asserted.meetingId = mid;
  if (!mid) {
    out.leftToDo = 'The call never started — the host is not on /call/<id>. Do not judge this screen.';
    await bob.browser.close(); return out;
  }
  progress(1);

  // bob joins, stays ~30 s
  await bob.page.goto(`${HOST}/w/${WS}/call/${mid}`, { waitUntil: 'domcontentloaded' });
  await bob.page.waitForTimeout(6000);
  await waitClick(bob.page, '[data-testid="lobby-join"]', { timeout: 25000 }).catch(() => {});
  await bob.page.waitForTimeout(9000);
  out.asserted.bobJoined = !!(await bob.page.$('[data-testid="call-controls-leave"]'));
  if (!out.asserted.bobJoined) {
    out.leftToDo = 'The second participant never got into the call. Do not judge this screen.';
    await bob.browser.close(); return out;
  }
  await bob.page.waitForTimeout(25000);

  // ── 2. bob leaves — two clicks, and the state is what proves it ────────
  await safeClick(bob.page, '[data-testid="call-controls-leave"]');
  await bob.page.waitForTimeout(1500);
  await safeClick(bob.page, '[data-testid="call-leave-confirm-submit"]');
  await bob.page.waitForTimeout(7000);
  out.asserted.bobLeft = !/\/call\//.test(bob.page.url());
  if (!out.asserted.bobLeft) {
    out.leftToDo = 'The second participant is still in the call — the leave confirmation was not '
                 + 'completed, so there is no absence to measure. Do not judge this screen.';
    await bob.browser.close(); return out;
  }
  progress(2);

  // ── 3. stay out, then rejoin ──────────────────────────────────────────
  await bob.page.waitForTimeout(45000);                       // the gap being mis-counted
  await bob.page.goto(`${HOST}/w/${WS}/call/${mid}`, { waitUntil: 'domcontentloaded' });
  await bob.page.waitForTimeout(6000);
  await waitClick(bob.page, '[data-testid="lobby-join"]', { timeout: 25000 }).catch(() => {});
  await bob.page.waitForTimeout(10000);
  out.asserted.bobRejoined = !!(await bob.page.$('[data-testid="call-controls-leave"]'));
  if (!out.asserted.bobRejoined) {
    out.leftToDo = 'The second participant did not get back into the call. Do not judge this screen.';
    await bob.browser.close(); return out;
  }
  await bob.page.waitForTimeout(15000);
  progress(3);

  // the two intervals the summary should be adding up, straight from the server
  out.asserted.segments = await page.evaluate(async (m) => {
    const r = await fetch(`/api/v1/meeting/${m}/events?limit=200`, { credentials: 'include' });
    const j = await r.json();
    return (j.events || [])
      .filter((e) => /^participant\.(joined|left)$/.test(e.event_type))
      .map((e) => `${e.occurred_at} ${e.event_type} ${(e.actor_user_id || '').slice(-8)}`)
      .reverse();
  }, mid);

  // ── 4. the host ends the call for everyone ────────────────────────────
  await page.evaluate(DOM);
  await safeClick(page, '[data-testid="call-controls-end-for-everyone"]');
  await page.waitForTimeout(1500);
  await safeClick(page, '[data-testid="call-end-confirm-submit"]');
  await page.waitForTimeout(10000);
  await page.evaluate(DOM);

  // ── 5. PROVE IT ───────────────────────────────────────────────────────
  const ov = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="call-ended-overlay"]');
    return el ? (el.innerText || '').replace(/\s+/g, ' ') : null;
  });
  out.asserted.summaryVisible = !!ov;
  out.asserted.summaryText = ov ? ov.slice(0, 400) : null;
  out.asserted.url = page.url();
  await bob.browser.close();

  if (!ov || !/in call/.test(ov)) {
    out.leftToDo = 'The call-ended summary did not render, so there is nothing to compare. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(4);
  out.ready = true;
  out.stepsDone = 4;
  out.leftToDo =
    'The call-ended summary is on screen. Read the second participant\'s "N in call" — it covers '
    + 'the whole span from their first join to the end, although they were out of the call for '
    + '45 seconds in the middle (see asserted.segments for the two real intervals). Now open '
    + `${HOST}/w/${WS}/calls/${out.asserted.meetingId} and press "View all": the same person on `
    + 'that screen shows the sum of the two intervals instead. The two numbers must agree.';
  return out;
};
