/* Repro — [FE-WEB][CHAT] Заметка в Saved Messages — единственное своё сообщение
 * без Edit и Reply.
 *
 *   ./d c:alice snip/c-saved-note-actions.mjs
 *
 * Writes a note into Saved Messages and leaves it centred on screen, with both
 * menus already read out for comparison. Opening More actions is the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01';
  const COMP = 'div[contenteditable="true"][aria-label="Compose message"]';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const tag = 'QANOTE' + Math.random().toString(36).slice(2, 6);

  const menuOf = async (id) => {
    const row = page.locator(`main [data-message-id="${id}"]`).first();
    await row.scrollIntoViewIfNeeded(); await row.hover(); await page.waitForTimeout(800);
    await row.locator('button[aria-label="More actions"]').first().click({ force: true });
    await page.waitForTimeout(1000);
    const items = await page.evaluate(() => {
      const m = document.querySelector('[role="menu"]');
      return m ? (m.innerText || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 14) : null;
    });
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    return items;
  };

  // ── 0. a saved copy of MY OWN channel message, for the comparison ─────
  const ch = 'C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  const ownId = await page.evaluate(async ({ ch, tag }) => {
    const r = await fetch('/api/v1/messaging/messages', { method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ channel_id: ch, body: tag + ' own channel message',
                             idempotency_key: 'qa-' + Math.random().toString(36).slice(2) }) });
    return (await r.json()).id;
  }, { ch, tag });
  await page.waitForTimeout(3000);
  {
    const row = page.locator(`main [data-message-id="${ownId}"]`).first();
    await row.scrollIntoViewIfNeeded(); await row.hover(); await page.waitForTimeout(700);
    await row.locator('button[aria-label="More actions"]').first().click({ force: true });
    await page.waitForTimeout(1000);
    const save = page.locator('[role="menu"]').getByText(/^Save$/).first();
    if (await save.count()) { await save.click(); await page.waitForTimeout(3000); }
    else { await page.keyboard.press('Escape'); await page.waitForTimeout(500); }
  }

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  const me = await page.evaluate(async () =>
    (await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json()).id);
  const comp = page.locator(COMP).first();
  if (!(await comp.count())) {
    out.leftToDo = 'Setup did not reach the state this finding needs — Saved Messages has no composer. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await comp.type(tag + ' note to self', { delay: 30 });
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
  progress(1);                                     // step 1: a note written in Saved Messages

  const rows = await page.evaluate(({ tag, me }) => {
    const all = [...document.querySelectorAll('main [data-message-id]')];
    const note = all.reverse().find(e => (e.innerText || '').includes(tag));
    // the saved copy of MY OWN channel message, saved a moment ago
    const copy = [...document.querySelectorAll('main [data-message-id]')]
      .filter(e => e !== note && (e.innerText || '').includes(tag + ' own channel message'))
      .pop();
    return {
      noteId: note ? note.getAttribute('data-message-id') : null,
      noteText: note ? (note.innerText || '').replace(/\s+/g, ' ').slice(0, 60) : null,
      copyId: copy ? copy.getAttribute('data-message-id') : null,
      copyText: copy ? (copy.innerText || '').replace(/\s+/g, ' ').slice(0, 60) : null,
      me,
    };
  }, { tag, me });
  if (!rows.noteId) {
    out.asserted = { rows };
    out.leftToDo = 'Setup did not reach the state this finding needs — the note is not in the list. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 2. PROVE IT ────────────────────────────────────────────────────────
  const noteMenu = await menuOf(rows.noteId);
  const copyMenu = rows.copyId ? await menuOf(rows.copyId) : null;
  await page.evaluate((id) => document.querySelector(`main [data-message-id="${id}"]`)
                                      ?.scrollIntoView({ block: 'center' }), rows.noteId);
  progress(2);                                     // step 2: its menu read

  out.asserted = {
    url: page.url(),
    signedInUser: me,
    note: { id: rows.noteId, text: rows.noteText, menu: noteMenu },
    savedCopyInSameList: { id: rows.copyId, text: rows.copyText, menu: copyMenu },
  };
  if (!noteMenu || noteMenu.some(x => /^(Edit|Reply)$/.test(x))) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the note\'s menu already offers '
                 + 'Edit or Reply. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    `Step 3 of the finding: the note "${rows.noteText}" is centred on the Saved Messages page. Hover `
    + 'it and open More actions (a hover menu cannot be handed over open). There is no Edit and no '
    + `Reply — the menu is: ${noteMenu.join(' | ')}. Now do the same on a saved copy of a channel `
    + (copyMenu ? `message in the same list (the row with "View original"): ${copyMenu.join(' | ')}. `
               : 'message in the same list. ')
    + 'Both were written by the same account. Your own message in an ordinary channel offers both too.';
  return out;
};
