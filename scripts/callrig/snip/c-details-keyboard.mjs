/* Repro — [FE-WEB][CHAT] Панель Channel details, открытая с клавиатуры,
 * остаётся практически недостижимой.
 *
 *   ./d c:alice snip/c-details-keyboard.mjs
 *
 * Opens the panel with Enter from the keyboard and leaves focus exactly where
 * the app left it — on the trigger button, outside the panel. Pressing Tab is
 * the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';   // long history
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  const focusInfo = () => page.evaluate(() => {
    const a = document.activeElement;
    // the panel: smallest visible element holding all the tabs and Close channel
    // details, and NOT the header trigger (which any wider container also holds)
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const cands = [...document.querySelectorAll('div,aside,section')].filter(e => vis(e)
      && e.querySelectorAll('[role="tab"]').length >= 4
      && e.querySelector('button[aria-label="Close channel details"]')
      && !e.querySelector('button[aria-label="Channel details"]'));
    cands.sort((x, y) => (x.innerText || '').length - (y.innerText || '').length);
    const panel = cands[0] || null;
    return {
      activeElement: a ? ((a.getAttribute('aria-label') || a.innerText || a.tagName)
                          .replace(/\s+/g, ' ').trim().slice(0, 40)) : null,
      panelFound: !!panel,
      panelContainsFocus: panel ? panel.contains(document.activeElement) : null,
      messagesRendered: document.querySelectorAll('main [data-message-id]').length,
    };
  });

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  const trigger = page.locator('button[aria-label="Channel details"]').first();
  if (!(await trigger.count())) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no Channel details button. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  await trigger.focus();
  await page.waitForTimeout(600);
  const onTrigger = await page.evaluate(() =>
    document.activeElement?.getAttribute('aria-label') || null);
  progress(1);                                     // step 1: focus on the Channel details button

  // ── 2. open it from the keyboard ──────────────────────────────────────
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const afterEnter = await focusInfo();
  progress(2);                                     // step 2: panel opened with Enter

  // where the next few Tabs go — measured, then focus put back on the trigger
  const stops = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(250);
    stops.push(await page.evaluate(() => {
      const a = document.activeElement;
      return a ? ((a.getAttribute('aria-label') || a.innerText || a.tagName)
                  .replace(/\s+/g, ' ').trim().slice(0, 34)) : null;
    }));
  }
  await trigger.focus();
  await page.waitForTimeout(500);
  const restored = await focusInfo();

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  out.asserted = {
    url: page.url(),
    focusBeforeEnter: onTrigger,
    afterEnter,
    firstSixTabStops: stops,
    focusRestoredTo: restored.activeElement,
    panelStillContainsFocus: restored.panelContainsFocus,
  };
  if (!afterEnter.panelFound || afterEnter.panelContainsFocus !== false
      || restored.panelContainsFocus !== false) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected the panel open with '
                 + 'focus outside it. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    'Step 3 of the finding: the Channel details panel is open and the focus ring is back on the '
    + '"Channel details" button in the header, outside the panel. Press Tab and keep pressing. Focus '
    + `goes into the message list instead of the panel — the first six stops are: ${stops.join(' → ')} `
    + `— and it walks every action of every one of the ${afterEnter.messagesRendered} rendered `
    + 'messages before the panel is reachable. Escape does close the panel.';
  return out;
};
