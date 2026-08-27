/* Repro — [FE-WEB][CHAT] Набранная целиком команда-эмотикон по Enter стирает
 * всё, что набрано после неё.
 *
 *   ./d c:alice snip/c-shrug-eats-tail.mjs
 *
 * Types "/shrug " plus a message into an empty composer, picking nothing from
 * the dropdown. Pressing Enter is the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';
  const COMP = 'div[contenteditable="true"][aria-label="Compose message"]';
  const TEXT = '/shrug LOSS1 please review';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  const comp = page.locator(COMP).first();
  let empty = false;
  for (let i = 0; i < 8; i++) {
    if ((await comp.evaluate(e => e.innerText.trim())) === '') { empty = true; break; }
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  if (!empty) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the composer would not empty '
                 + '(Lexical restores drafts asynchronously). Re-run, or follow the written steps by hand.';
    return out;
  }
  await comp.click();
  await page.keyboard.type(TEXT, { delay: 45 });   // nothing picked from the dropdown
  await page.waitForTimeout(1200);
  progress(1);                                     // step 1: whole command plus text typed

  // ── 2. PROVE IT ────────────────────────────────────────────────────────
  const state = await page.evaluate((COMP) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const c = document.querySelector(COMP);
    const send = [...document.querySelectorAll('button[aria-label="Send"]')].filter(vis)[0];
    return { composerText: (c.innerText || '').replace(/\n/g, '\\n').trim(),
             dropdownsOpen: [...document.querySelectorAll('[role="listbox"],[role="menu"]')].filter(vis).length,
             caretInComposer: c.contains(document.activeElement) || c === document.activeElement,
             sendEnabled: send ? !send.disabled : null };
  }, COMP);

  out.asserted = { url: page.url(), typed: TEXT, ...state };
  if (state.composerText !== TEXT || !state.caretInComposer) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the composer does not hold the '
                 + `exact text "${TEXT}". Re-run, or follow the written steps by hand.`;
    return out;
  }

  // ── 3. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;
  out.leftToDo =
    `Step 2 of the finding: the composer holds "${TEXT}" exactly as typed, nothing was chosen from the `
    + 'command dropdown, and the caret is in the field. Press Enter once. The whole field is replaced '
    + 'by the shrug emoticon and "LOSS1 please review" is gone — no warning, and nothing is sent. '
    + 'Press Enter a second time and only the emoticon reaches the channel. '
    + '/tableflip and /unflip behave the same; /me keeps the tail.';
  return out;
};
