/* Repro — [FE-WEB][CHAT][CHANNEL DETAILS] Кнопка Remove в списке участников
 * канала не делает ничего.
 *
 *   ./d c:alice snip/c-remove-member.mjs
 *
 * Stops with the Members tab open and the Remove button proven present,
 * enabled and topmost. The click is the human's.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';   // alice owns this channel
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const me = await page.evaluate(async () =>
    (await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json()).id);
  const owner = await page.evaluate(async (ch) => {
    const r = await fetch(`/api/v1/channels/${ch}`, { credentials: 'include' });
    const j = await r.json().catch(() => ({}));
    return j.owner_id ?? j.created_by ?? j.channel?.owner_id ?? null;
  }, ch);
  progress(1);                                    // step 1: signed in as owner, channel open

  await page.locator('button[aria-label="Channel details"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(3000);
  const tab = page.locator('[role="tab"]').filter({ hasText: /^Members/ }).first();
  if (!(await tab.count())) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no Members tab. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  await tab.click();
  await page.waitForTimeout(3000);
  progress(2);                                    // step 2: Channel details -> Members

  // ── 2. PROVE IT ────────────────────────────────────────────────────────
  const btn = await page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    // "Remove <name>" in the member row — not "Remove <emoji> reaction" in the message list
    const b = [...document.querySelectorAll('button[aria-label^="Remove "]')]
                .filter(e => !/reaction/i.test(e.getAttribute('aria-label') || '')).filter(vis)[0];
    if (!b) return null;
    const r = b.getBoundingClientRect();
    let op = 1; for (let n = b; n; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      label: b.getAttribute('aria-label'),
      disabled: b.disabled, ariaDisabled: b.getAttribute('aria-disabled'),
      size: Math.round(r.width) + '×' + Math.round(r.height),
      opacityProduct: op,
      pointerEvents: getComputedStyle(b).pointerEvents,
      topmost: !!top && (top === b || b.contains(top)),
    };
  });
  const members = await page.evaluate(async (ch) => {
    const r = await fetch(`/api/v1/channels/${ch}/members`, { credentials: 'include' });
    const j = await r.json().catch(() => null); const a = j?.members || j?.data || j;
    return Array.isArray(a) ? a.length : ('status ' + r.status);
  }, ch);
  const tabActive = await page.evaluate(() => {
    const t = [...document.querySelectorAll('[role="tab"]')]
      .find(x => /^Members/.test((x.innerText || '').trim()));
    return t ? (t.getAttribute('aria-selected') ?? t.getAttribute('data-state')) : null;
  });

  out.asserted = {
    url: page.url(),
    signedInUser: me,
    channelOwner: owner,
    iAmChannelOwner: owner === me,
    membersTabSelected: tabActive,
    membersOnServer: members,
    removeButton: btn,
  };
  if (!btn || btn.disabled || !btn.topmost) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the Remove button is not '
                 + 'present/enabled/topmost on the Members tab. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo = `Step 3 of the finding: click the "${btn.label}" button on the Members tab `
    + '(the icon at the right-hand end of that member\'s row). Watch for a confirmation, a toast, '
    + 'or the row disappearing — the member count above the list should go from '
    + `${members} to ${Number(members) - 1}. Nothing happens.`;
  return out;
};
