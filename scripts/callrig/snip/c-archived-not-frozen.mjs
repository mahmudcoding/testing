/* Repro — [BE][CHAT] Архивный канал не заморожен: отправка отбивается,
 * а правка сообщений, реакции, закрепление и переименование проходят.
 *
 *   ./d c:alice snip/c-archived-not-frozen.mjs
 *
 * Lands in an archived channel of the signed-in user, with one of their own
 * messages on screen, no reaction on it and nothing pinned. Reacting to it is
 * the human's step.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE — an archived channel of mine holding a message of mine ──
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  let target = await page.evaluate(async (ws) => {
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
  if (!target) {                                   // none yet — build one
    target = await page.evaluate(async (ws) => {
      const r = await fetch('/api/v1/channels', { method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'qa-c-archived-probe', type: 'private', workspace_id: ws }) });
      const c = await r.json(); if (!c.id) return null;
      let mid = null;
      for (let i = 0; i < 6 && !mid; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const p = await fetch('/api/v1/messaging/messages', { method: 'POST', credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ channel_id: c.id, body: 'QA archived-channel probe',
                                 idempotency_key: 'qa-' + Math.random().toString(36).slice(2) }) });
        if (p.status === 200) mid = (await p.json()).id;
      }
      await fetch(`/api/v1/channels/${c.id}/archive`, { method: 'POST', credentials: 'include' });
      return mid ? { id: c.id, name: c.name, messageId: mid, body: 'QA archived-channel probe' } : null;
    }, ws);
  }
  if (!target) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no archived channel with a '
                 + 'message of this account. Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(1);                                     // step 1: an archived channel with history

  // clear anything a previous run left, so the human starts from a clean message
  await page.evaluate(async ({ ch, mid }) => {
    const j = await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,
                                 { credentials: 'include' })).json();
    const m = (j.messages || []).find(x => x.id === mid);
    // POST toggles a reaction off — DELETE on this route is 405
    for (const r of (m?.reactions || []))
      await fetch(`/api/v1/messaging/channels/${ch}/messages/${mid}/reactions`, { method: 'POST',
        credentials: 'include', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ emoji: r.emoji }) });
    if (m?.pinned)
      await fetch(`/api/v1/messaging/channels/${ch}/messages/${mid}/pin`, { method: 'POST',
        credentials: 'include', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pin: false }) });
  }, { ch: target.id, mid: target.messageId });

  await page.goto(`https://airion-cargo.store/w/${ws}/c/${target.id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const el = page.locator(`main [data-message-id="${target.messageId}"]`).first();
  if (!(await el.count())) {
    out.asserted = { target, url: page.url() };
    out.leftToDo = 'Setup did not reach the state this finding needs — the message is not on screen. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(700);

  // ── 2. PROVE IT ────────────────────────────────────────────────────────
  const seen = await page.evaluate(async ({ ch, mid }) => {
    const vis = x => { const r = x.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const e = document.querySelector(`main [data-message-id="${mid}"]`);
    const send = await fetch('/api/v1/messaging/messages', { method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ channel_id: ch, body: 'QA archived send attempt',
                             idempotency_key: 'qa-' + Math.random().toString(36).slice(2) }) });
    const sendBody = (await send.text()).slice(0, 110);
    const j = await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,
                                 { credentials: 'include' })).json();
    const m = (j.messages || []).find(x => x.id === mid);
    return {
      composersOnScreen: document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]').length,
      sendAttempt: { status: send.status, body: sendBody },
      hoverControls: [...e.querySelectorAll('button')].filter(vis)
        .map(b => (b.getAttribute('aria-label') || b.innerText || '').trim().slice(0, 26)).filter(Boolean),
      messageNow: { reactions: JSON.stringify(m?.reactions || []), pinned: m?.pinned,
                    body: (m?.body || '').slice(0, 40) },
    };
  }, { ch: target.id, mid: target.messageId });

  out.asserted = { url: page.url(), channel: target.name, ...seen };
  if (seen.composersOnScreen !== 0 || seen.sendAttempt.status !== 403
      || !seen.hoverControls.includes('Add reaction')
      || seen.messageNow.reactions !== '[]' || seen.messageNow.pinned) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected an archived channel '
                 + '(no composer, sending refused 403) with the message hover controls available and the '
                 + 'message carrying no reaction and not pinned. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;
  out.leftToDo =
    `You are in the archived channel #${target.name}. There is no composer and the server refuses to `
    + 'accept a message here (403 MESSAGING_CHANNEL_ARCHIVED — see the measurement above). '
    + `Step 2: hover the message "${target.body}" and click Add reaction, then pick any emoji — the `
    + 'reaction is accepted and appears under the message. Step 3: on the same message, More actions '
    + '→ Pin message — it pins and the "Pinned message … View all (1)" banner appears. '
    + 'Step 4: reload the page — both survive, in a channel the team believes is closed.';
  return out;
};
