/* Repro — [FE-WEB][CHAT] Copy text копирует технический username
 * вместо имени человека.
 *
 *   ./d c:alice snip/c-copytext-username.mjs
 *
 * Sends a message mentioning someone, picked from the @ suggestion list, and
 * centres it on screen. Copy text and paste is the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCGENERAL0001';
  const COMP = 'div[contenteditable="true"][aria-label="Compose message"]';
  const HANDLE = 'qa_c_carol';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const tag = 'QACOPY' + Math.random().toString(36).slice(2, 6);

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  const comp = page.locator(COMP).first();
  for (let i = 0; i < 8; i++) {
    if ((await comp.evaluate(e => e.innerText.trim())) === '') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  await comp.click();
  await comp.type('@' + HANDLE, { delay: 60 });
  await page.waitForTimeout(2200);
  const opt = page.locator('[role="option"], [role="listbox"] li').first();
  const picked = await opt.count();
  if (picked) { await opt.click(); await page.waitForTimeout(900); }
  await comp.type(' ' + tag + ' check', { delay: 35 });
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5500);
  progress(1);                                     // step 1: message with a picked mention sent

  const msg = await page.evaluate(async ({ ch, tag }) => {
    const j = await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=5`,
                                 { credentials: 'include' })).json();
    const m = (j.messages || []).find(x => (x.body || '').replace(/\\/g, '').includes(tag));
    if (!m) return null;
    const e = document.querySelector(`main [data-message-id="${m.id}"]`);
    if (e) e.scrollIntoView({ block: 'center' });
    return { id: m.id, storedBody: m.body,
             mention_ids: m.mention_ids === undefined ? '(absent)' : JSON.stringify(m.mention_ids),
             onScreen: e ? (e.innerText || '').replace(/\s+/g, ' ').slice(0, 70) : null };
  }, { ch, tag });

  // ── 2. PROVE IT ────────────────────────────────────────────────────────
  out.asserted = { url: page.url(), pickedFromSuggestionList: !!picked, message: msg };
  if (!picked || !msg || msg.mention_ids === '(absent)' || !/@QA /.test(msg.onScreen || '')) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected a real mention, picked '
                 + 'from the list, rendered with the person\'s display name. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;
  out.leftToDo =
    `Step 2 of the finding: the message "${msg.onScreen}" is centred in the channel — on screen the `
    + 'mention shows the person\'s display name. Hover it, open More actions and click Copy text, '
    + 'then paste into the message field (or anywhere else). What comes out names the person by '
    + `their technical login instead: the stored body is ${JSON.stringify(msg.storedBody)}. The `
    + 'backslash escapes are unescaped correctly on the way to the clipboard — only the mention is '
    + 'left as the raw handle.';
  return out;
};
