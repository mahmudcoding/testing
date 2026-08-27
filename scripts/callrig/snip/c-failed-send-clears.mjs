/* Repro — [FE-WEB][CHAT] Неудачная отправка стирает набранное сообщение,
 * а тост советует повторить.
 *
 *   ./d c:alice snip/c-failed-send-clears.mjs
 *
 * Uses the finding's own no-interception path: the thread panel of a message in
 * an ARCHIVED channel offers a working composer and Send, and the server
 * answers 403. Types the message and stops. Pressing Send is the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01';
  const COMP = 'div[contenteditable="true"][aria-label="Compose message"]';
  const TEXT = 'A long reply I would rather not lose — QA check of the failed-send path';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE — an archived channel of mine with a message of mine ──
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const target = await page.evaluate(async (ws) => {
    const me = (await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json()).id;
    const j = await (await fetch(`/api/v1/users/me/channels/archived?workspace_id=${ws}`,
                                 { credentials: 'include' })).json();
    for (const c of (j.channels || j.data || j || [])) {
      const m = await (await fetch(`/api/v1/messaging/channels/${c.id}/messages?limit=20`,
                                   { credentials: 'include' })).json();
      const mine = (m.messages || []).filter(x => (x.user_id || x.sender_id || x.author_id) === me
                                                  && (x.body || '').trim());
      if (mine.length) return { id: c.id, name: c.name, messageId: mine[0].id };
    }
    return null;
  }, ws);
  if (!target) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no archived channel with a '
                 + 'message of this account. Run snip/c-archived-not-frozen.mjs once (it builds one), '
                 + 'or follow the written steps by hand.';
    return out;
  }
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${target.id}?thread=${target.messageId}`,
                  { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  progress(1);                                     // step 1: a composer to type into

  // ── 2. type the message ───────────────────────────────────────────────
  const comps = page.locator(COMP);
  const n = await comps.count();
  if (!n) {
    out.asserted = { target, url: page.url(), composers: n };
    out.leftToDo = 'Setup did not reach the state this finding needs — the thread panel of the archived '
                 + 'channel shows no composer. Re-run, or follow the written steps by hand.';
    return out;
  }
  const comp = comps.last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await comp.type(TEXT, { delay: 12 });
  await page.waitForTimeout(700);

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  const state = await page.evaluate(async ({ COMP, ch, mid }) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const cs = [...document.querySelectorAll(COMP)];
    const c = cs[cs.length - 1];
    const send = [...document.querySelectorAll('button[aria-label="Send"]')].filter(vis).pop();
    // what the server will answer for this reply — measured, not assumed
    const probe = await fetch('/api/v1/messaging/messages', { method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ channel_id: ch, body: 'QA archived thread probe', thread_parent_id: mid,
                             idempotency_key: 'qa-' + Math.random().toString(36).slice(2) }) });
    return { composerCount: cs.length,
             composerText: (c.innerText || '').replace(/\n/g, ' ').trim().slice(0, 80),
             sendEnabled: send ? !send.disabled : null,
             serverAnswerForThisReply: { status: probe.status, body: (await probe.text()).slice(0, 90) } };
  }, { COMP, ch: target.id, mid: target.messageId });

  out.asserted = { url: page.url(), archivedChannel: target.name, ...state };
  if (!state.sendEnabled || state.composerText !== TEXT
      || state.serverAnswerForThisReply.status !== 403) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected the typed text in an '
                 + 'enabled thread composer whose reply the server refuses with 403. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  progress(2);          // step 2: the text is in the thread composer, Send enabled
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    `Step 3 of the finding: the thread panel holds "${TEXT}" and its Send button is enabled, but this `
    + 'channel is archived and the server refuses the reply with 403 (measured above). Press Send. '
    + 'The composer empties, the text is gone — no draft, and Cmd+Z does not bring it back — while '
    + 'the toast says the message could not be sent and to try again. The same happens in an ordinary '
    + 'channel whenever the send request fails.';
  return out;
};
