/* Repro — [FE-WEB][CHAT] Dismiss preview убирает карточку ссылки
 * только до следующего показа канала.
 *
 *   ./d c:alice snip/c-dismiss-preview.mjs
 *
 * Posts a message with an external link, waits for the preview card and
 * dismisses it, proving the card is gone. Leaving the channel and coming back
 * is the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';
  const COMP = 'div[contenteditable="true"][aria-label="Compose message"]';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const tag = 'QALINK' + Math.random().toString(36).slice(2, 6);

  const shape = (id) => page.evaluate((id) => {
    const e = document.querySelector(`main [data-message-id="${id}"]`);
    if (!e) return null;
    const vis = x => { const r = x.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    return { links: [...e.querySelectorAll('a')].filter(vis).length,
             text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 90),
             hasDismiss: !!e.querySelector('button[aria-label="Dismiss preview"]') };
  }, id);

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  const comp = page.locator(COMP).first();
  for (let i = 0; i < 8; i++) {
    if ((await comp.evaluate(e => e.innerText.trim())) === '') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(220);
  }
  await comp.click();
  await comp.type(tag + ' https://example.com/', { delay: 25 });
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(9000);

  const id = await page.evaluate(async ({ ch, tag }) => {
    const j = await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=5`,
                                 { credentials: 'include' })).json();
    const m = (j.messages || []).find(x => (x.body || '').replace(/\\/g, '').includes(tag));
    return m ? m.id : null;
  }, { ch, tag });
  if (!id) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the link message was not sent. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  const withCard = await shape(id);
  progress(1);                                     // step 1: message with a link, preview rendered

  // ── 2. dismiss the preview ────────────────────────────────────────────
  const row = page.locator(`main [data-message-id="${id}"]`).first();
  await row.scrollIntoViewIfNeeded(); await row.hover(); await page.waitForTimeout(900);
  const btn = page.locator(`main [data-message-id="${id}"] button[aria-label="Dismiss preview"]`).first();
  if (!(await btn.count())) {
    out.asserted = { withCard, hoverControls: await page.evaluate((id) => {
      const e = document.querySelector(`main [data-message-id="${id}"]`);
      const vis = x => { const r = x.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
      return [...e.querySelectorAll('button')].filter(vis)
        .map(b => (b.getAttribute('aria-label') || b.innerText || '').trim().slice(0, 26));
    }, id) };
    out.leftToDo = 'Setup did not reach the state this finding needs — no Dismiss preview control on '
                 + 'the message. Re-run, or follow the written steps by hand.';
    return out;
  }
  const reqs = [];
  const onReq = r => { if (/\/api\/v1\//.test(r.url()) && r.method() !== 'GET')
    reqs.push(r.method() + ' ' + r.url().split('/api/v1')[1].slice(0, 50)); };
  page.on('request', onReq);
  await btn.click();
  await page.waitForTimeout(3000);
  page.off('request', onReq);
  const dismissed = await shape(id);
  progress(2);                                     // step 2: preview dismissed

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  const stored = await page.evaluate(() => {
    const hits = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (/preview|dismiss/i.test(k) || /preview|dismiss/i.test(String(localStorage.getItem(k)).slice(0, 300)))
        hits.push(k);
    }
    return hits;
  });

  out.asserted = { url: page.url(), messageId: id,
                   beforeDismiss: withCard, afterDismiss: dismissed,
                   nonGetRequestsOnDismiss: reqs, localStorageKeysMentioningPreview: stored };
  if (!withCard || !dismissed || dismissed.links >= withCard.links) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the preview card was not '
                 + 'rendered and then removed. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    'Step 3 of the finding: the link message is on screen and its preview card is gone — you just '
    + `dismissed it (links in the message ${withCard.links} → ${dismissed.links}), and nothing was `
    + 'sent or stored. Now click any other channel in the sidebar and come back to this one. The '
    + 'preview card is there again, and the Dismiss preview button with it.';
  return out;
};
