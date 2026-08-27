/* Repro — [FE-WEB][CHAT] Кнопка Unmute notifications не снимает приглушение.
 *
 *   ./d c:alice snip/c-unmute-dead.mjs
 *
 * Mutes the channel through the UI and stops with the header button reading
 * "Unmute notifications". Pressing it is the human's step.
 */
import { DOM } from './lib.mjs';

export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';
  const sel = 'button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  // start from a known-unmuted channel so the state under test is the one we set.
  // The mute the header reads lives in localStorage ("aloqa.channel.mute"), so the
  // server-side DELETE alone does not reset the screen.
  await page.evaluate(async (ch) => {
    await fetch(`/api/v1/notifications/channels/${ch}/mute`, { method: 'DELETE', credentials: 'include' });
    localStorage.removeItem('aloqa.channel.mute');
  }, ch);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await page.evaluate(DOM);

  const before = await page.evaluate((s) => {
    const b = document.querySelector(s);
    return b ? { label: b.getAttribute('aria-label'), pressed: b.getAttribute('aria-pressed') } : null;
  }, sel);
  if (!before || before.label !== 'Mute notifications') {
    out.leftToDo = 'Setup did not reach the state this finding needs — the header button is not '
                 + '"Mute notifications" on a clean channel. Re-run, or follow the written steps by hand.';
    out.asserted = { before };
    return out;
  }

  await page.locator(sel).first().click();
  await page.waitForTimeout(1300);
  const durations = await page.evaluate(() => {
    const w = document.querySelector('[data-radix-popper-content-wrapper]');
    return w ? (w.innerText || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 8) : [];
  });
  const picked = await page.evaluate(() => window.__qa.popperPick('For 1 hour'));
  await page.waitForTimeout(3000);
  progress(1);                                   // step 1: Mute notifications -> For 1 hour

  // ── 2. PROVE IT ────────────────────────────────────────────────────────
  const btn = await page.evaluate((s) => {
    const b = document.querySelector(s);
    if (!b) return null;
    const r = b.getBoundingClientRect();
    let op = 1; for (let n = b; n; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { label: b.getAttribute('aria-label'), pressed: b.getAttribute('aria-pressed'),
             disabled: b.disabled, opacityProduct: op,
             topmost: !!top && (top === b || b.contains(top)) };
  }, sel);
  const muteState = await page.evaluate(async (ch) => {
    const r = await fetch(`/api/v1/workspaces/W4QCF1XTURESO01/channels`, { credentials: 'include' });
    const j = await r.json().catch(() => ({}));
    const list = j.channels || j.data || j || [];
    const c = (Array.isArray(list) ? list : []).find(x => x.id === ch) || {};
    return { is_muted: c.is_muted ?? c.muted ?? null, muted_until: c.muted_until ?? null };
  }, ch);

  out.asserted = {
    url: page.url(),
    durationsOffered: durations,
    pickedDuration: picked,
    headerButton: btn,
    channelMuteFieldsFromServer: muteState,
  };
  if (!btn || btn.label !== 'Unmute notifications' || btn.pressed !== 'true' || !btn.topmost) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the channel is not showing as '
                 + 'muted. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;
  out.leftToDo =
    'Step 2 of the finding: click the "Unmute notifications" button in the channel header (the bell, '
    + 'top right of the message area). Then try the second path — right-click the channel in the '
    + 'sidebar and choose Unmute. Step 3: the button still reads "Unmute notifications" and the '
    + 'channel is still muted; no request leaves the page either way. '
    + 'This run leaves the channel muted for 1 hour — clearing it needs '
    + 'DELETE /api/v1/notifications/channels/<id>/mute, which is the point of the finding.';
  return out;
};
