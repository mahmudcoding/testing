/* Repro — [FE-WEB][CHAT][THREADS] Удалённый ответ остаётся в открытой панели
 * треда вместе с прежним счётчиком.
 *
 *   ./d c:alice snip/c-thread-del-stale.mjs
 *
 * Opens a thread, then deletes the reply and a channel message with one
 * request, exactly as the finding measured it, and leaves both on screen: the
 * channel message already marked deleted, the reply untouched. The delete is
 * NOT done from the panel's own menu — that path updates optimistically and
 * hides the defect (measured). Watching the panel is the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const tag = 'QADEL' + Math.random().toString(36).slice(2, 6);

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  const ids = await page.evaluate(async ({ ch, tag }) => {
    const post = async (b) => {
      const r = await fetch('/api/v1/messaging/messages', { method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...b, idempotency_key: 'qa-' + Math.random().toString(36).slice(2) }) });
      return (await r.json()).id;
    };
    const p  = await post({ channel_id: ch, body: tag + ' parent' });
    const r1 = await post({ channel_id: ch, body: tag + ' reply', thread_parent_id: p });
    const cm = await post({ channel_id: ch, body: tag + ' channel message' });
    return { p, r1, cm };
  }, { ch, tag });
  await page.waitForTimeout(2500);

  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${ids.p}`,
                  { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const before = await page.evaluate(({ r1, cm }) => ({
    header: (document.body.innerText.match(/Replies \(\d+\)/) || [null])[0],
    reply: ([...document.querySelectorAll(`[data-message-id="${r1}"]`)].pop()?.innerText || '')
             .replace(/\s+/g, ' ').slice(0, 60),
    channelMessage: (document.querySelector(`main [data-message-id="${cm}"]`)?.innerText || '')
             .replace(/\s+/g, ' ').slice(0, 60),
  }), ids);
  if (!before.header || !before.reply || !before.channelMessage) {
    out.asserted = { before, ids };
    out.leftToDo = 'Setup did not reach the state this finding needs — the thread panel is not open '
                 + 'on a reply with a channel message beside it. Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(1);                                     // step 1: thread open with a reply

  // ── 2. one request deletes the reply and a channel message ────────────
  const del = await page.evaluate(async ({ ch, r1, cm }) => {
    const r = await fetch(`/api/v1/messaging/channels/${ch}/messages`, { method: 'DELETE',
      credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message_ids: [r1, cm] }) });
    return { status: r.status };
  }, { ch, ...ids });
  await page.waitForTimeout(12000);
  progress(2);                                     // step 2: both deleted by one request

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  const after = await page.evaluate(({ r1, cm }) => ({
    header: (document.body.innerText.match(/Replies \(\d+\)/) || [null])[0],
    reply: ([...document.querySelectorAll(`[data-message-id="${r1}"]`)].pop()?.innerText || '')
             .replace(/\s+/g, ' ').slice(0, 60),
    channelMessage: (document.querySelector(`main [data-message-id="${cm}"]`)?.innerText || '')
             .replace(/\s+/g, ' ').slice(0, 60),
    visibilityState: document.visibilityState,
  }), ids);

  out.asserted = { url: page.url(), deleteRequest: { ...del, ids: [ids.r1, ids.cm] },
                   panelBefore: before, panelAfter12s: after };
  if (del.status !== 200 || /was deleted/i.test(after.reply)
      || !/was deleted/i.test(after.channelMessage) || after.header !== before.header) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected the channel message '
                 + 'marked deleted while the thread reply and its counter stay unchanged. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    'Step 3 of the finding: look at the two panes without reloading. In the channel on the left, the '
    + `message deleted by that request already reads "This message was deleted". In the thread panel `
    + `on the right, the reply deleted by the SAME request is still there in full — "${after.reply}" — `
    + `and the header still says "${after.header}". Keep watching: it never changes. Then reload the `
    + 'page and the panel finally shows the reply as deleted.';
  return out;
};
