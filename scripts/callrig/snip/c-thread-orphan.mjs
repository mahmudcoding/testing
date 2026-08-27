/* Repro — [BE][CHAT][THREADS] После удаления сообщения с тредом ответы
 * становятся недостижимы, а панель обещает их и предлагает бесконечный Retry.
 *
 *   ./d c:alice snip/c-thread-orphan.mjs
 *
 * Builds a message with three replies, deletes it through the message menu and
 * opens its thread. Pressing Retry is the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  const tag = 'QA-ORPHAN-' + Math.random().toString(36).slice(2, 6);
  const ids = await page.evaluate(async ({ ch, tag }) => {
    const post = async (b) => {
      const r = await fetch('/api/v1/messaging/messages', { method: 'POST', credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...b, idempotency_key: 'qa-' + Math.random().toString(36).slice(2) }) });
      return (await r.json()).id;
    };
    const p = await post({ channel_id: ch, body: tag + ' parent' });
    const rs = [];
    for (let i = 1; i <= 3; i++) rs.push(await post({ channel_id: ch, body: tag + ' reply ' + i, thread_parent_id: p }));
    return { p, rs };
  }, { ch, tag });
  await page.waitForTimeout(2500);

  const before = await page.evaluate(async (p) => {
    const r = await fetch(`/api/v1/messaging/messages/${p}/thread?limit=100`, { credentials: 'include' });
    const j = await r.json().catch(() => ({}));
    return { status: r.status, replies: (j.replies || []).length };
  }, ids.p);
  if (before.status !== 200 || before.replies !== 3) {
    out.asserted = { before };
    out.leftToDo = 'Setup did not reach the state this finding needs — the thread does not hold three '
                 + 'replies. Re-run, or follow the written steps by hand.';
    return out;
  }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const marker = await page.evaluate((p) => {
    const e = document.querySelector(`main [data-message-id="${p}"]`);
    return e ? (e.innerText || '').replace(/\s+/g, ' ').slice(0, 100) : null;
  }, ids.p);
  progress(1);                                    // step 1: message with a thread of 3 replies

  // ── 2. delete the parent through the message menu ─────────────────────
  const el = page.locator(`main [data-message-id="${ids.p}"]`).first();
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(600);
  await el.locator('button[aria-label="More actions"]').first().click({ force: true });
  await page.waitForTimeout(900);
  await page.locator('[role="menu"]').getByText('Delete', { exact: true }).first().click();
  await page.waitForTimeout(1300);
  await page.locator('[role="dialog"] button, [role="alertdialog"] button')
            .filter({ hasText: /^Delete$/ }).first().click();
  await page.waitForTimeout(5000);
  progress(2);                                    // step 2: parent deleted

  // ── 3. open its thread ────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${ids.p}`,
                  { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  progress(3);                                    // step 3: thread opened

  // ── 4. PROVE IT ────────────────────────────────────────────────────────
  const seen = await page.evaluate(async ({ ch, p, tag }) => {
    const vis = x => { const r = x.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const t = document.body.innerText.replace(/\s+/g, ' ');
    const r = await fetch(`/api/v1/messaging/messages/${p}/thread?limit=100`, { credentials: 'include' });
    const body = (await r.text()).slice(0, 130);
    const j = await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=10`,
                                 { credentials: 'include' })).json();
    const m = (j.messages || []).find(x => x.id === p);
    return {
      repliesHeader: (t.match(/Replies \(\d+\)/) || [null])[0],
      couldNotLoad: /Could not load replies/i.test(t),
      retryButton: [...document.querySelectorAll('button')].filter(vis)
                     .some(b => /^Retry$/i.test((b.innerText || '').trim())),
      anyReplyTextOnPage: t.includes(tag + ' reply'),
      threadEndpoint: { status: r.status, body },
      storedParent: m ? { body: m.body, reply_count: m.reply_count } : 'not in last 10',
    };
  }, { ch, p: ids.p, tag });

  out.asserted = {
    url: page.url(),
    threadBeforeDelete: before,
    parentInChannelAfterDelete: marker && 'rendered as: This message was deleted',
    ...seen,
  };
  if (!seen.repliesHeader || !seen.couldNotLoad || !seen.retryButton || seen.threadEndpoint.status !== 404) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected the thread panel to '
                 + 'show "Replies (N)", "Could not load replies." and a Retry button. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 5. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 3;
  out.leftToDo =
    `The thread panel is open on the right. It says "${seen.repliesHeader}" over the deleted message `
    + 'and then "Could not load replies." Press Retry — it fails the same way every time, and no '
    + 'reply text ever appears. Nothing on screen says the replies are gone for good, while the '
    + 'message itself keeps reporting a reply count.';
  return out;
};
