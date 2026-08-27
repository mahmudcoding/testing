/* Repro — [FE-WEB][CHAT] После правки сообщения текст, начинавшийся с «-»,
 * «#» или «>», превращается в разметку.
 *
 *   ./d c:alice snip/c-edit-markdown.mjs
 *
 * Sends "- …" through the composer, opens Edit on it and appends a character.
 * Pressing Save changes is the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';
  const COMP = 'div[contenteditable="true"][aria-label="Compose message"]';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const tag = 'QA-MD-' + Math.random().toString(36).slice(2, 6);

  // ── 1. GET THERE — send it through the composer, which escapes markdown ──
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  const comp = page.locator(COMP).first();
  for (let i = 0; i < 8; i++) {
    if ((await comp.evaluate(e => e.innerText.trim())) === '') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(220);
  }
  await comp.click();
  await comp.type('- ' + tag + ' list item', { delay: 30 });
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(4000);

  const sent = await page.evaluate(async ({ ch, tag }) => {
    const j = await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=5`,
                                 { credentials: 'include' })).json();
    // stored bodies are markdown-escaped ("QA\-MD\-1j2z"), so unescape before matching
    const m = (j.messages || []).find(x => (x.body || '').replace(/\\/g, '').includes(tag));
    if (!m) return null;
    const e = document.querySelector(`main [data-message-id="${m.id}"]`);
    return { id: m.id, storedBody: m.body,
             rendered: e ? (e.innerText || '').replace(/\s+/g, ' ').slice(0, 70) : null,
             listNodes: e ? e.querySelectorAll('ul,ol,li').length : null };
  }, { ch, tag });
  if (!sent || !sent.storedBody.startsWith('\\-') || sent.listNodes !== 0) {
    out.asserted = { sent };
    out.leftToDo = 'Setup did not reach the state this finding needs — the message was not stored '
                 + 'escaped and rendered as plain text. Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(1);                                     // step 1: "- …" sent, rendered as plain text

  // ── 2. open Edit and append a character ───────────────────────────────
  const el = page.locator(`main [data-message-id="${sent.id}"]`).first();
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(700);
  await el.locator('button[aria-label="More actions"]').first().click({ force: true });
  await page.waitForTimeout(1000);
  await page.locator('[role="menu"]').getByText('Edit', { exact: true }).first().click();
  await page.waitForTimeout(2000);
  const editor = page.locator('div[contenteditable="true"]').last();
  await editor.click();
  await page.keyboard.press('End');
  await page.keyboard.type('Z', { delay: 40 });
  await page.waitForTimeout(700);

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  const state = await page.evaluate(() => {
    const vis = x => { const r = x.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const save = [...document.querySelectorAll('button[aria-label="Save changes"]')].filter(vis)[0];
    const ed = [...document.querySelectorAll('div[contenteditable="true"]')].filter(vis).pop();
    return {
      editingBannerOnScreen: /Editing message/i.test(document.body.innerText),
      editorText: ed ? (ed.innerText || '').replace(/\n/g, '\\n').slice(0, 60) : null,
      saveButton: save ? { disabled: save.disabled, ariaDisabled: save.getAttribute('aria-disabled') } : null,
    };
  });

  out.asserted = { url: page.url(), messageId: sent.id, storedBody: sent.storedBody,
                   renderedBeforeEdit: sent.rendered, listNodesBeforeEdit: sent.listNodes, ...state };
  if (!state.saveButton || state.saveButton.disabled || !state.editorText
      || !state.editorText.startsWith('- ')) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the edit field is not open on '
                 + 'the "- …" text with Save changes enabled. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;
  out.leftToDo =
    `Step 2 of the finding is half done: the message is in edit mode reading "${state.editorText}" `
    + '(the trailing Z is the added character). Click the check mark to the right of the edit field '
    + '(Save changes). The message comes back as a bullet list with the leading "- " gone from the '
    + 'screen, instead of the plain line it was a moment ago. It survives a full page reload, and '
    + 'editing again saves the markup.';
  return out;
};
