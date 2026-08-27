/* Repro — [FE-WEB][CHAT][THREADS] Цитата ответа в треде показывает служебное
 * экранирование markdown.
 *
 *   ./d c:alice snip/c-thread-quote-escape.mjs
 *
 * Builds a thread, posts a reply carrying markdown characters and presses
 * "Reply here" on it, so the quote preview is in the thread composer. Typing
 * and sending is the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';
  const COMP = 'div[contenteditable="true"][aria-label="Compose message"]';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const tag = 'QAQ' + Math.random().toString(36).slice(2, 6);

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  const parent = await page.evaluate(async ({ ch, tag }) => {
    const r = await fetch('/api/v1/messaging/messages', { method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ channel_id: ch, body: tag + ' thread parent',
                             idempotency_key: 'qa-' + Math.random().toString(36).slice(2) }) });
    return (await r.json()).id;
  }, { ch, tag });
  await page.waitForTimeout(3000);

  const el = page.locator(`main [data-message-id="${parent}"]`).first();
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(700);
  await el.locator('button[aria-label="More actions"]').first().click({ force: true });
  await page.waitForTimeout(1000);
  await page.locator('[role="menu"]').getByText('Reply', { exact: true }).first().click();
  await page.waitForTimeout(3500);
  if (!/thread=/.test(page.url())) {
    out.asserted = { url: page.url() };
    out.leftToDo = 'Setup did not reach the state this finding needs — the thread panel did not open. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(1);                                     // step 1: thread open

  // ── 2. a reply carrying markdown characters, typed into the thread field ──
  const REPLY = tag + ' **b** _i_ x-y';
  const comp = page.locator(COMP).last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await comp.type(REPLY, { delay: 30 });
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(4500);

  const reply = await page.evaluate(async ({ parent, tag }) => {
    const j = await (await fetch(`/api/v1/messaging/messages/${parent}/thread?limit=50`,
                                 { credentials: 'include' })).json();
    const m = (j.replies || []).find(x => (x.body || '').replace(/\\/g, '').includes(tag));
    if (!m) return null;
    const e = document.querySelector(`[data-message-id="${m.id}"]`);
    return { id: m.id, storedBody: m.body,
             renderedInThread: e ? (e.innerText || '').replace(/\s+/g, ' ').slice(0, 80) : null };
  }, { parent, tag });
  if (!reply || !/\\/.test(reply.storedBody)) {
    out.asserted = { reply };
    out.leftToDo = 'Setup did not reach the state this finding needs — the thread reply was not stored '
                 + 'markdown-escaped. Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(2);                                     // step 2: reply with markdown sent into the thread

  // ── 3. "Reply here" on that reply ─────────────────────────────────────
  const row = page.locator(`[data-message-id="${reply.id}"]`).last();
  await row.scrollIntoViewIfNeeded(); await row.hover(); await page.waitForTimeout(800);
  const rh = page.locator('button[aria-label="Reply here"], button:has-text("Reply here")').first();
  if (!(await rh.count())) {
    const labels = await page.evaluate((id) => {
      const e = document.querySelector(`[data-message-id="${id}"]`);
      const vis = x => { const r = x.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
      return [...e.querySelectorAll('button')].filter(vis)
        .map(b => (b.getAttribute('aria-label') || b.innerText || '').trim().slice(0, 26));
    }, reply.id);
    out.asserted = { reply, hoverControls: labels };
    out.leftToDo = 'Setup did not reach the state this finding needs — no "Reply here" control on the '
                 + 'thread reply. Re-run, or follow the written steps by hand.';
    return out;
  }
  await rh.click();
  await page.waitForTimeout(2000);

  // ── 4. PROVE IT ────────────────────────────────────────────────────────
  const quote = await page.evaluate((COMP) => {
    const vis = x => { const r = x.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const comps = [...document.querySelectorAll(COMP)].filter(vis);
    const t = comps[comps.length - 1];
    // the quote preview sits outside the contenteditable — take the smallest
    // visible ancestor of the composer that carries a backslash-escaped line
    let node = t, found = null;
    for (let i = 0; i < 6 && node; i++, node = node.parentElement) {
      const txt = (node.innerText || '');
      if (/\\[-*_]/.test(txt)) { found = txt.replace(/\s+/g, ' ').slice(0, 120); break; }
    }
    return { quotePreview: found, composerText: (t.innerText || '').slice(0, 40) };
  }, COMP);

  out.asserted = {
    url: page.url(),
    replyStoredBody: reply.storedBody,
    replyRenderedInThread: reply.renderedInThread,
    quotePreviewInComposer: quote.quotePreview,
    composerText: quote.composerText,
  };
  if (!quote.quotePreview) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no quote preview carrying '
                 + 'markdown escapes above the thread field. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 5. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    'Step 3 of the finding: the quote preview is above the thread field and already shows the '
    + `original with backslashes — "${quote.quotePreview}". Two lines above it, the same reply is `
    + `rendered correctly as "${reply.renderedInThread}". Type any text and press Enter: the sent `
    + 'message keeps the backslashes in the quoted part, and they stay in the history.';
  return out;
};
