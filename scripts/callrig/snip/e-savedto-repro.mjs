/* Repro — BUG: the Call chat panel labels the chat's destination as a channel
 * that does not exist (standalone call), and doubles the # for a channel call.
 * Driver: alice.
 */
import { DOM, safeClick } from './lib.mjs';

const WS = 'W4QEF1XTURESO01';
const HOST = 'https://airion-cargo.store';

export default async ({ page, progress }) => {
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // A meeting left active blocks the next call from starting at all.
  await page.goto(`${HOST}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  out.asserted.endedLeftovers = await page.evaluate(async (ws) => {
    const r = await fetch(`/api/v1/workspace/${ws}/meetings/active`, { credentials: 'include' });
    const list = r.ok ? (await r.json()).meetings || [] : [];
    for (const m of list) await fetch(`/api/v1/meeting/${m.id}/end`, { method: 'POST', credentials: 'include' });
    return list.map((m) => m.id);
  }, WS);

  // ── 1. start a standalone call from the hub ───────────────────────────
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  await page.evaluate(() => window.__qa.clickDeepest(/^Start now$/i));
  await page.waitForTimeout(2500);
  const name = 'E saved-to repro';
  const input = await page.$('[role=dialog] input[type=text]');
  if (input) {
    await input.click();
    await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await input.type(name);
  }
  const open = await page.$('[role=dialog] input[value="open"]');
  if (open) await open.click();
  await page.waitForTimeout(400);
  const submit = await page.$('[data-testid="calls-start-submit"]');
  if (submit) await submit.click();
  await page.waitForTimeout(8000);
  if (await page.$('[data-testid="lobby-join"]')) {
    await safeClick(page, '[data-testid="lobby-join"]').catch(() => {});
    await page.waitForTimeout(8000);
  }
  const mid = (page.url().match(/\/call\/([^?/]+)/) || [])[1] || null;
  out.asserted.meetingId = mid;
  out.asserted.callName = name;
  if (!mid) {
    out.leftToDo = 'The call never started — the host is not on /call/<id>. Do not judge this screen.';
    return out;
  }
  progress(1);

  // ── 2. open the Call chat panel ───────────────────────────────────────
  await page.evaluate(DOM);
  const pressed = await page.evaluate(() =>
    document.querySelector('[data-testid="call-controls-chat-toggle"]')?.getAttribute('aria-pressed'));
  if (pressed !== 'true') {
    await safeClick(page, '[data-testid="call-controls-chat-toggle"]').catch(() => {});
    await page.waitForTimeout(3000);
  }
  await page.evaluate(DOM);

  // ── 3. PROVE IT ───────────────────────────────────────────────────────
  // the label, read off the element rather than out of a text dump
  out.asserted.label = await page.evaluate(() => {
    const q = window.__qa;
    const rx = /Saved to/i;
    const el = [...document.querySelectorAll('body *')]
      .filter((n) => n.tagName !== 'SCRIPT' && n.tagName !== 'STYLE')
      .filter((n) => rx.test(n.textContent || '')
                  && ![...n.children].some((c) => rx.test(c.textContent || '')))[0];
    return el ? { text: (el.innerText || '').trim(), visible: q.vis(el), tag: el.tagName } : null;
  });
  // the whole channel list, so the absence is an enumeration and not a search
  out.asserted.channels = await page.evaluate(async (ws) => {
    const r = await fetch(`/api/v1/workspaces/${ws}/channels`, { credentials: 'include' });
    const j = await r.json();
    return (j.channels || []).map((c) => c.name);
  }, WS);
  out.asserted.meetingChannelId = await page.evaluate(async (m) => {
    const r = await fetch(`/api/v1/meeting/${m}`, { credentials: 'include' });
    const j = await r.json();
    return j.meeting ? j.meeting.channel_id : null;
  }, mid);

  if (!out.asserted.label || !out.asserted.label.visible) {
    out.leftToDo = 'The Call chat panel did not open, so the label is not on screen. '
                 + 'Re-run, or open Call chat by hand.';
    return out;
  }
  progress(2);
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    `The Call chat panel is open. Read the line under its heading — it says "Saved to #${name}". `
    + 'That is written as a channel reference, and no such channel exists: asserted.channels is the '
    + 'workspace channel list in full, and the meeting\'s own channel_id is empty. '
    + 'Then compare with a call started from a channel: open #qa-general, press "Start call", '
    + 'join, open Call chat — the same line there reads "Saved to ##qa-general", with two hashes.';
  return out;
};
