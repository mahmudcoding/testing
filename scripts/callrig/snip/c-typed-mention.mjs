/* Repro — [FE-WEB][CHAT] Напечатанное @имя выглядит как упоминанием,
 * но упоминанием не отправляется.
 *
 *   ./d c:alice snip/c-typed-mention.mjs
 *
 * Sends the control first (a mention picked from the suggestion list), then
 * leaves a hand-typed @handle sitting unsent in the composer. Pressing Send is
 * the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCGENERAL0001';
  const COMP = 'div[contenteditable="true"][aria-label="Compose message"]';
  const HANDLE = 'qa_c_carol';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const tag = 'QAMEN' + Math.random().toString(36).slice(2, 6);

  const comp = () => page.locator(COMP).first();
  const clear = async () => {
    for (let i = 0; i < 8; i++) {
      if ((await comp().evaluate(e => e.innerText.trim())) === '') return true;
      await comp().click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
      await page.waitForTimeout(250);
    }
    return false;
  };

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  const posts = [];
  page.on('request', r => { if (/\/api\/v1\/messaging\/messages$/.test(r.url()) && r.method() === 'POST')
    posts.push((r.postData() || '').slice(0, 220)); });

  // control: pick the person from the suggestion list
  await clear(); await comp().click();
  await comp().type('@' + HANDLE, { delay: 60 });
  await page.waitForTimeout(2200);
  const opt = page.locator('[role="option"], [role="listbox"] li').first();
  const pickedFromList = await opt.count();
  if (pickedFromList) { await opt.click(); await page.waitForTimeout(900); }
  await comp().type(' ' + tag + ' PICKED', { delay: 35 });
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
  const controlPost = posts[posts.length - 1] || null;
  progress(2);                                     // step 2 of the finding (the control) is done

  // the case under test: type the same handle, pick nothing
  await clear(); await comp().click();
  await comp().type('@' + HANDLE, { delay: 60 });
  await page.waitForTimeout(2200);
  await page.keyboard.type(' ' + tag + ' MANUAL', { delay: 35 });   // a space dismisses the list
  await page.waitForTimeout(900);
  progress(1);                                     // step 1: typed, nothing picked

  // ── 2. PROVE IT ────────────────────────────────────────────────────────
  const state = await page.evaluate(({ COMP, tag }) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const c = document.querySelector(COMP);
    const send = [...document.querySelectorAll('button[aria-label="Send"]')].filter(vis)[0];
    const control = [...document.querySelectorAll('main [data-message-id]')]
      .filter(e => (e.innerText || '').includes(tag + ' PICKED')).pop();
    return {
      composerText: (c.innerText || '').replace(/\n/g, '\\n').trim().slice(0, 60),
      suggestionListOpen: [...document.querySelectorAll('[role="listbox"]')].filter(vis).length,
      sendEnabled: send ? !send.disabled : null,
      controlOnScreen: control ? (control.innerText || '').replace(/\s+/g, ' ').slice(0, 70) : null,
      controlMentionChips: control ? control.querySelectorAll('a[href*="/u/"],[data-mention],[class*="mention"]').length : null,
    };
  }, { COMP, tag });

  out.asserted = {
    url: page.url(),
    controlPickedFromList: !!pickedFromList,
    controlSendRequest: controlPost,
    controlRendered: state.controlOnScreen,
    composerNowHoldsTypedMention: state.composerText,
    suggestionListOpen: state.suggestionListOpen,
    sendEnabled: state.sendEnabled,
  };
  if (!pickedFromList || !controlPost || !/mention_user_ids/.test(controlPost)
      || !state.composerText.startsWith('@' + HANDLE) || !state.sendEnabled) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected the control to be sent '
                 + 'with mention_user_ids and the typed handle to be sitting in the composer. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    `Step 3 of the finding: the control is already in the channel — "${state.controlOnScreen}" — sent `
    + `with mention_user_ids in the request. The composer now holds "${state.composerText}", typed by `
    + 'hand with nothing chosen from the suggestion list. Press Send. On screen the two messages are '
    + 'indistinguishable: the same coloured, clickable name chip. Only the request differs — the '
    + 'second one carries no mention_user_ids. Open the mentioned person\'s window to see it: they get '
    + '"New channel message" for the typed one and "You were mentioned" for the control, and only the '
    + 'control appears on their Mentions page.';
  return out;
};
