/* Repro — [FE-WEB][CHAT] Команда /me, выбранная из меню, не применяется —
 * в канал уходит текст со слэшем.
 *
 *   ./d c:alice snip/c-slash-me.mjs
 *
 * Picks /me from the composer's command list and types the action text after
 * it. Pressing Send is the human's step.
 *
 * NOTE for the reader: on v0.61.0-rc.6 picking /me leaves "/" in the composer,
 * not the "/me" the report recorded on the older build. The command is still
 * not applied and a literal slash still reaches the channel; only the leftover
 * text differs.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';
  const COMP = 'div[contenteditable="true"][aria-label="Compose message"]';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  const clear = async (comp) => {
    for (let i = 0; i < 8; i++) {
      if ((await comp.evaluate(e => e.innerText.trim())) === '') return true;
      await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
      await page.waitForTimeout(250);
    }
    return false;
  };
  const openListAndPick = async (comp, needle) => {
    await clear(comp); await comp.click();
    await page.keyboard.type('/'); await page.waitForTimeout(2400);
    const box = await page.evaluate((needle) => {
      const v = e => { const r = e.getBoundingClientRect(); return r.width > 3 && r.height > 3; };
      const l = [...document.querySelectorAll('[role="listbox"],[role="menu"]')].filter(v)[0];
      if (!l) return null;
      const items = [...l.querySelectorAll('[role="option"],[role="menuitem"],button')].filter(v);
      const o = items.find(x => (x.innerText || '').replace(/\s+/g, ' ').includes(needle));
      if (!o) return { items: items.map(x => (x.innerText || '').replace(/\s+/g, ' ').slice(0, 30)) };
      const r = o.getBoundingClientRect();
      return { x: r.left + r.width * 0.6, y: r.top + r.height / 2,
               label: (o.innerText || '').replace(/\s+/g, ' ').slice(0, 34),
               items: items.map(x => (x.innerText || '').replace(/\s+/g, ' ').slice(0, 30)) };
    }, needle);
    if (!box || box.x === undefined) return { picked: false, box };
    await page.mouse.click(box.x, box.y);
    await page.waitForTimeout(2200);
    return { picked: true, label: box.label, items: box.items,
             composerAfter: await comp.evaluate(e => e.innerText.replace(/\n/g, '\\n').trim().slice(0, 40)) };
  };

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  const comp = page.locator(COMP).first();

  // the control first, so the difference is measured in the same session
  const shrug = await openListAndPick(comp, '/shrug');
  const me = await openListAndPick(comp, '/me Send action message');
  if (!me.picked) {
    out.asserted = { shrug, me };
    out.leftToDo = 'Setup did not reach the state this finding needs — no /me entry in the command '
                 + 'list. Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(1);                                     // step 1: /me picked from the list

  // ── 2. type the action text after it ──────────────────────────────────
  await comp.click(); await page.keyboard.press('End');
  await page.keyboard.type(' PS1 waves', { delay: 40 });
  await page.waitForTimeout(900);

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  const state = await page.evaluate((COMP) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const c = document.querySelector(COMP);
    const send = [...document.querySelectorAll('button[aria-label="Send"]')].filter(vis)[0];
    return { composerText: (c.innerText || '').replace(/\n/g, '\\n').trim().slice(0, 60),
             sendEnabled: send ? !send.disabled : null };
  }, COMP);

  out.asserted = {
    url: page.url(),
    commandList: me.items,
    control_shrugPicked: { label: shrug.label, composerAfter: shrug.composerAfter },
    me_picked: { label: me.label, composerAfter: me.composerAfter },
    composerBeforeSend: state.composerText,
    sendEnabled: state.sendEnabled,
  };
  if (!/^\//.test(state.composerText) || !state.sendEnabled
      || shrug.composerAfter === me.composerAfter) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected /me to leave a literal '
                 + 'slash in the composer while /shrug is applied. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;
  out.leftToDo =
    `Step 2 of the finding: the composer holds "${state.composerText}". Picking `
    + `"${me.label}" from the command list left the slash behind and applied nothing — the composer `
    + `read "${me.composerAfter}" straight after the pick. Press the Send button: the message reaches `
    + 'the channel with the slash still in the text, and no action message is produced. '
    + `Control (step 3): picking "${shrug.label}" from the same list a moment ago turned the composer `
    + `into "${shrug.composerAfter}" — that command is applied in place and never reaches the channel `
    + 'as text.';
  return out;
};
