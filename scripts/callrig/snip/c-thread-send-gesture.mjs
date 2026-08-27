/* Repro — [FE-WEB][CHAT][THREADS] В треде форматирование молча меняет жест
 * отправки, а видимая подсказка говорит обратное.
 *
 *   ./d c:alice snip/c-thread-send-gesture.mjs
 *
 * Opens a thread, types into the thread field and presses Bold. Typing the last
 * character and pressing Enter is the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';
  const COMP = 'div[contenteditable="true"][aria-label="Compose message"]';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  const mid = await page.evaluate(async (ch) => {
    const r = await fetch('/api/v1/messaging/messages', { method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ channel_id: ch, body: 'QA thread parent ' + Math.random().toString(36).slice(2, 6),
                             idempotency_key: 'qa-' + Math.random().toString(36).slice(2) }) });
    return (await r.json()).id;
  }, ch);
  await page.waitForTimeout(3000);

  const el = page.locator(`main [data-message-id="${mid}"]`).first();
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(600);
  await el.locator('button[aria-label="More actions"]').first().click({ force: true });
  await page.waitForTimeout(900);
  await page.locator('[role="menu"]').getByText('Reply', { exact: true }).first().click();
  await page.waitForTimeout(3500);
  if (!/thread=/.test(page.url())) {
    out.asserted = { url: page.url() };
    out.leftToDo = 'Setup did not reach the state this finding needs — the thread panel did not open. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(1);                                    // step 1: thread panel open

  const comp = page.locator(COMP).last();
  await comp.click();
  await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await comp.type('QA thread reply');
  await page.waitForTimeout(400);
  await page.locator('button[aria-label="Bold"]').last().click();
  await page.waitForTimeout(800);
  await comp.click();                             // caret back in the thread field
  await page.waitForTimeout(400);
  progress(2);                                    // step 2: text typed, Bold pressed

  // ── 2. PROVE IT ────────────────────────────────────────────────────────
  const seen = await page.evaluate((COMP) => {
    const info = e => {
      const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      let op = 1; for (let n = e; n; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
      return { text: (e.textContent || '').trim().slice(0, 60), x: Math.round(r.x), y: Math.round(r.y),
               opacityProduct: op, visibility: cs.visibility, ariaHidden: e.getAttribute('aria-hidden') };
    };
    const hints = [...document.querySelectorAll('span,div,p')]
      .filter(e => /to send/i.test(e.textContent || '') && e.children.length === 0).map(info);
    const md = [...document.querySelectorAll('button[aria-label="Markdown formatting"]')]
      .map(b => ({ x: Math.round(b.getBoundingClientRect().x), pressed: b.getAttribute('aria-pressed') }));
    const comps = [...document.querySelectorAll(COMP)];
    const t = comps[comps.length - 1];
    return { hints, markdownButtons: md,
             composerCount: comps.length,
             threadComposerText: (t.innerText || '').replace(/\n/g, '\\n').slice(0, 60),
             focusInThreadComposer: t.contains(document.activeElement) || t === document.activeElement };
  }, COMP);

  const threadHint = seen.hints.find(h => h.visibility === 'hidden');
  const channelHint = seen.hints.find(h => h.visibility !== 'hidden');
  out.asserted = {
    url: page.url(),
    ...seen,
    threadHintVisible: threadHint ? false : null,
    channelHintText: channelHint ? channelHint.text : null,
  };
  if (seen.composerCount < 2 || !threadHint || !channelHint
      || seen.markdownButtons.filter(b => b.pressed === 'true').length !== 1
      || !seen.focusInThreadComposer) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected two composers, the '
                 + 'thread hint hidden, the channel hint visible and exactly one Markdown formatting '
                 + 'button pressed, with the caret in the thread field. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    'Step 3 of the finding: type one more character into the thread field on the right (the caret is '
    + 'already there) and press Enter. The reply is not sent — the field just grows by an empty line '
    + `and no "Replies (N)" marker appears. The only hint on screen, under the channel field on the `
    + `left, says "${channelHint.text}". The thread\'s own hint sits on the same screen line at `
    + `x≈${threadHint.x} and is rendered visibility:hidden / aria-hidden="true"; it is the one that `
    + 'now reads "Cmd/Ctrl+Enter to send". Cmd+Enter does send the reply.';
  return out;
};
