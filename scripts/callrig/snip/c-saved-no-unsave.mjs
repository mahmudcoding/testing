/* Repro — [FE-WEB][CHAT][SAVED MESSAGES] Убрать сообщение из Saved Messages
 * можно только действием, которое обещает удалить его навсегда.
 *
 *   ./d c:alice snip/c-saved-no-unsave.mjs
 *
 * Saves someone else's message and lands on Saved Messages with that entry
 * scrolled into view. Opening its More actions menu is the human's step —
 * a hover menu cannot be left open across the end of a drive.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCGENERAL0001';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const plain = s => (s || '').replace(/\\/g, '');

  // ── 1. GET THERE — save a message written by somebody else ────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const me = await page.evaluate(async () =>
    (await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json()).id);
  // newest message by another author that is actually rendered on this screen
  const other = await page.evaluate(async ({ ch, me }) => {
    const j = await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=50`,
                                 { credentials: 'include' })).json();
    const m = (j.messages || []).find(x => (x.user_id || x.sender_id || x.author_id) !== me
      && (x.body || '').trim().length > 6
      && document.querySelector(`main [data-message-id="${x.id}"]`));
    return m ? { id: m.id, body: m.body, author: m.user_id || m.sender_id || m.author_id } : null;
  }, { ch, me });
  if (!other) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no message by another author '
                 + 'in this channel. Re-run, or follow the written steps by hand.';
    return out;
  }

  const el = page.locator(`main [data-message-id="${other.id}"]`).first();
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(700);
  await el.locator('button[aria-label="More actions"]').first().click({ force: true });
  await page.waitForTimeout(1000);
  const channelMenu = await page.evaluate(() => {
    const m = document.querySelector('[role="menu"]');
    return m ? (m.innerText || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 12) : null;
  });
  const save = page.locator('[role="menu"]').getByText(/^(Save|Unsave)$/).first();
  const label = (await save.count()) ? (await save.innerText()).trim() : null;
  if (label === 'Save') { await save.click(); await page.waitForTimeout(2500); }
  else { await page.keyboard.press('Escape'); await page.waitForTimeout(600); }
  progress(1);                                    // step 1: someone else's message is saved

  // ── 2. Saved Messages ─────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  const needle = plain(other.body).slice(0, 24);
  const entry = await page.evaluate((needle) => {
    const rows = [...document.querySelectorAll('main [data-message-id]')];
    const hit = rows.reverse().find(e => (e.innerText || '').includes(needle));
    if (!hit) return null;
    hit.scrollIntoView({ block: 'center' });
    return { id: hit.getAttribute('data-message-id'),
             text: (hit.innerText || '').replace(/\s+/g, ' ').slice(0, 70) };
  }, needle);
  if (!entry) {
    out.asserted = { other, needle, channelMenu };
    out.leftToDo = 'Setup did not reach the state this finding needs — the saved copy is not on the '
                 + 'Saved Messages page. Re-run, or follow the written steps by hand.';
    return out;
  }

  const row = page.locator(`main [data-message-id="${entry.id}"]`).first();
  await row.hover(); await page.waitForTimeout(800);
  const rowControls = await page.evaluate((id) => {
    const e = document.querySelector(`main [data-message-id="${id}"]`);
    const vis = x => { const r = x.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    return [...e.querySelectorAll('button,a,[role="button"]')].filter(vis)
      .map(b => ((b.getAttribute('aria-label') || b.innerText || '').replace(/\s+/g, ' ').trim()).slice(0, 32))
      .filter(Boolean);
  }, entry.id);
  await row.locator('button[aria-label="More actions"]').first().click({ force: true });
  await page.waitForTimeout(1100);
  const savedMenu = await page.evaluate(() => {
    const m = document.querySelector('[role="menu"]');
    return m ? (m.innerText || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 14) : null;
  });
  const unsaveOnPage = await page.evaluate(() => /unsave/i.test(document.body.innerText));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.evaluate((id) => document.querySelector(`main [data-message-id="${id}"]`)
                                      ?.scrollIntoView({ block: 'center' }), entry.id);
  progress(2);                                    // step 2: Saved Messages open, entry hovered

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  out.asserted = {
    url: page.url(),
    sourceMessageAuthorIsSomeoneElse: other.author !== me,
    menuInTheChannel: channelMenu,
    savedEntry: entry,
    savedRowControls: rowControls,
    savedEntryMenu: savedMenu,
    wordUnsaveAnywhereOnSavedPage: unsaveOnPage,
  };
  if (!savedMenu || savedMenu.some(x => /^unsave$/i.test(x)) || !savedMenu.some(x => /^delete$/i.test(x))) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected the saved entry\'s '
                 + 'menu to offer Delete and no Unsave. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    `Step 3 of the finding: the saved entry "${entry.text}" is in the middle of the Saved Messages `
    + 'page. Hover it and open More actions (a hover menu cannot be handed over open). There is no '
    + `Unsave — the menu is: ${savedMenu.join(' | ')}. Click Delete and read the confirmation: it says `
    + 'the message will be permanently deleted and cannot be recovered, although the original in the '
    + 'channel survives. Compare with the same message in #qa-general, whose menu does offer Unsave.';
  return out;
};
