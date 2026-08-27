/* Repro — [FE-WEB][CHAT] Переход к давнему сообщению молча не доходит до цели
 * («Jump to pinned message» и ссылка на сообщение).
 *
 *   ./d c:alice snip/c-jump-pinned.mjs
 *
 * Pins the oldest message of a long channel and reloads clean, so the banner is
 * on screen and its target is provably not in the loaded history. The click is
 * the human's.
 */
export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';   // ~400 messages
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  // walk the history back to its first message
  const oldest = await page.evaluate(async (ch) => {
    let url = `/api/v1/messaging/channels/${ch}/messages?limit=100`, msg = null, minSeq = null, pages = 0;
    for (let i = 0; i < 10; i++) {
      const j = await (await fetch(url, { credentials: 'include' })).json();
      const arr = j.messages || j.data || []; if (!arr.length) break;
      pages++;
      const mn = Math.min(...arr.map(m => m.channel_seq));
      msg = arr.find(m => m.channel_seq === mn);
      if (minSeq !== null && mn >= minSeq) break;
      minSeq = mn;
      url = `/api/v1/messaging/channels/${ch}/messages?limit=100&before_seq=${mn}`;
    }
    return { pages, seq: minSeq, id: msg?.id, body: (msg?.body || '').slice(0, 40) };
  }, ch);
  if (!oldest.id) {
    out.leftToDo = 'Setup did not reach the state this finding needs — could not read the channel '
                 + 'history. Re-run, or follow the written steps by hand.';
    return out;
  }

  const pinned = await page.evaluate(async ({ ch, mid }) => {
    const j = await (await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,
                                 { credentials: 'include' })).json();
    for (const x of (j?.messages || []))
      await fetch(`/api/v1/messaging/channels/${ch}/messages/${x.id}/pin`, { method: 'POST',
        credentials: 'include', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pin: false }) });
    const p = await fetch(`/api/v1/messaging/channels/${ch}/messages/${mid}/pin`, { method: 'POST',
      credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pin: true }) });
    return { clearedFirst: (j?.messages || []).length, pinStatus: p.status };
  }, { ch, mid: oldest.id });
  progress(1);                                    // step 1: an early message is pinned

  // clean load — the pin must be part of the initial state
  await page.goto('about:blank'); await page.waitForTimeout(900);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);

  // ── 2. PROVE IT ────────────────────────────────────────────────────────
  const state = await page.evaluate((mid) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
    const b = [...document.querySelectorAll('button[aria-label="Jump to pinned message"]')].filter(vis)[0];
    return {
      bannerButton: b ? (b.innerText || '').replace(/\s+/g, ' ').slice(0, 60) : null,
      bannerVisible: !!b,
      targetInDom: !!document.querySelector(`main [data-message-id="${mid}"]`),
      messagesLoaded: document.querySelectorAll('main [data-message-id]').length,
    };
  }, oldest.id);

  out.asserted = {
    url: page.url(),
    oldestMessage: { seq: oldest.seq, id: oldest.id, pagesWalkedBack: oldest.pages },
    pin: pinned,
    ...state,
  };
  if (!state.bannerVisible || state.targetInDom || pinned.pinStatus !== 200) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected the pinned banner on '
                 + 'screen with its target NOT among the loaded messages. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 1;
  out.leftToDo =
    `Step 2 of the finding: click the pinned banner at the top of the channel — the strip reading `
    + `"${state.bannerButton}" (aria-label "Jump to pinned message"). Its target is message seq `
    + `${oldest.seq}, the first message of the channel, and it is not among the `
    + `${state.messagesLoaded} messages loaded now. Watch the message area: nothing moves, no message `
    + 'is highlighted, no toast and no "Message older than loaded history" banner appears. '
    + 'Control (step 3): scrolling the list up with the wheel does reach that same message.';
  return out;
};
