/* Repro — [FE-WEB][CHAT] В архивном канале пункт Edit предлагается и не делает ничего.
 *
 *   ./d c:alice snip/c-archived-edit-noop.mjs
 *
 * Lands in an archived channel on one of the signed-in user's own messages and
 * proves the message menu offers an enabled Edit. Opening the menu and clicking
 * Edit is the human's step — a hover menu cannot be handed over open.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const target = await page.evaluate(async (ws) => {
    const me = (await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json()).id;
    const j = await (await fetch(`/api/v1/users/me/channels/archived?workspace_id=${ws}`,
                                 { credentials: 'include' })).json();
    for (const c of (j.channels || j.data || j || [])) {
      const m = await (await fetch(`/api/v1/messaging/channels/${c.id}/messages?limit=20`,
                                   { credentials: 'include' })).json();
      const mine = (m.messages || []).filter(x => (x.user_id || x.sender_id || x.author_id) === me
                                                  && (x.body || '').trim());
      if (mine.length) return { id: c.id, name: c.name, messageId: mine[0].id,
                                body: (mine[0].body || '').slice(0, 40) };
    }
    return null;
  }, ws);
  if (!target) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no archived channel with a '
                 + 'message of this account. Run snip/c-archived-not-frozen.mjs once (it builds one), '
                 + 'or follow the written steps by hand.';
    return out;
  }
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${target.id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  progress(1);                                     // step 1: archived channel with my messages, open

  const el = page.locator(`main [data-message-id="${target.messageId}"]`).first();
  if (!(await el.count())) {
    out.asserted = { target, url: page.url() };
    out.leftToDo = 'Setup did not reach the state this finding needs — the message is not on screen. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(700);
  await el.locator('button[aria-label="More actions"]').first().click({ force: true });
  await page.waitForTimeout(1000);

  // ── 2. PROVE IT ────────────────────────────────────────────────────────
  const menu = await page.evaluate(() => {
    const m = document.querySelector('[role="menu"]');
    if (!m) return null;
    const items = (m.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
    const it = [...m.querySelectorAll('[role="menuitem"],button,div')]
                 .find(x => (x.innerText || '').trim() === 'Edit');
    if (!it) return { items, edit: null };
    const r = it.getBoundingClientRect();
    let op = 1; for (let n = it; n; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { items, edit: { disabled: it.disabled ?? null, ariaDisabled: it.getAttribute('aria-disabled'),
             pointerEvents: getComputedStyle(it).pointerEvents, opacityProduct: op,
             topmost: !!top && (top === it || it.contains(top)) } };
  });
  const archived = await page.evaluate(async (ch) => {
    const r = await fetch('/api/v1/messaging/messages', { method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ channel_id: ch, body: 'QA archived send attempt',
                             idempotency_key: 'qa-' + Math.random().toString(36).slice(2) }) });
    return { status: r.status, body: (await r.text()).slice(0, 90),
             composers: document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]').length };
  }, target.id);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.evaluate((id) => document.querySelector(`main [data-message-id="${id}"]`)
                                      ?.scrollIntoView({ block: 'center' }), target.messageId);

  out.asserted = { url: page.url(), channel: target.name, message: target.body,
                   channelIsArchived: archived, messageMenu: menu };
  if (!menu || !menu.edit || menu.edit.disabled || !menu.edit.topmost
      || archived.status !== 403 || archived.composers !== 0) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected an archived channel '
                 + 'whose message menu offers an enabled Edit. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;
  out.leftToDo =
    `Step 2 of the finding: in the archived channel #${target.name}, hover the message `
    + `"${target.body}" (centred on screen), open More actions and click Edit. The menu closes and `
    + 'nothing else happens — no edit field, no "Editing message", no error, no request. '
    + 'Control: the same message menu in #qa-general opens the editor immediately.';
  return out;
};
