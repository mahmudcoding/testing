/* Repro — [BE][CHAT] Ответивший в треде не узнаёт о следующих ответах:
 * ни уведомления, ни отметки, ни способа подписаться.
 *
 *   ./d c:bob snip/c-thread-no-notify.mjs
 *
 * Drives three accounts: A posts, B (this window) replies, C replies after.
 * Lands B in the open thread panel with C's reply already delivered and
 * B's notification list provably unchanged. Opening the bell is B's step.
 */
import { rigPort } from '../rigmap.mjs';

const other = async (account, fn) => {
  const { chromium } = await import('playwright');
  const b = await chromium.connectOverCDP(`http://127.0.0.1:${rigPort('C', account)}`);
  const p = b.contexts()[0].pages().find(x => x.url().includes('airion-cargo.store'))
         || b.contexts()[0].pages()[0];
  try { return await fn(p); } finally { await b.close(); }
};

export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCGENERAL0001';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const tag = 'QATHR' + Math.random().toString(36).slice(2, 6);

  const post = (p, body) => p.evaluate(async (body) => {
    const r = await fetch('/api/v1/messaging/messages', { method: 'POST', credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...body, idempotency_key: 'qa-' + Math.random().toString(36).slice(2) }) });
    return { status: r.status, id: (await r.json().catch(() => ({}))).id };
  }, body);
  const notifs = (p) => p.evaluate(async () => {
    const j = await (await fetch('/api/v1/notifications?limit=30', { credentials: 'include' })).json();
    const a = j.notifications || j.data || j || [];
    return { total: j.total ?? a.length, newest: a.slice(0, 2).map(n => ({ type: n.type, title: n.title,
             body: (n.body || '').slice(0, 40) })) };
  });

  // ── 1. A posts a message; B replies in its thread ─────────────────────
  const parent = await other('alice', async (ap) => {
    await ap.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
    await ap.waitForTimeout(7000);
    const r = await post(ap, { channel_id: ch, body: tag + ' parent from A' });
    return r.id;
  });
  if (!parent) {
    out.leftToDo = 'Setup did not reach the state this finding needs — A could not post. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${parent}`,
                  { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const mine = await post(page, { channel_id: ch, body: tag + ' reply from B', thread_parent_id: parent });
  await page.waitForTimeout(4000);
  progress(1);                                     // step 1: A posted, B replied in the thread

  const bBefore = await notifs(page);
  const aBefore = await other('alice', notifs);

  // ── 2. C replies in the same thread ───────────────────────────────────
  const cReply = await other('carol', async (cp) => {
    await cp.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
    await cp.waitForTimeout(7000);
    return post(cp, { channel_id: ch, body: tag + ' third-party reply from C', thread_parent_id: parent });
  });
  if (cReply.status !== 200) {
    out.asserted = { cReply };
    out.leftToDo = 'Setup did not reach the state this finding needs — C could not reply. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(2);                                     // step 2: C replied

  // give the notification path 30 s, sampling B's own list from B's session
  const samples = [];
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(3000);
    const n = await notifs(page);
    samples.push({ total: n.total, visibilityState: await page.evaluate(() => document.visibilityState) });
  }
  const bAfter = await notifs(page);
  const aAfter = await other('alice', notifs);
  progress(3);                                     // step 3: both sides compared

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  const panel = await page.evaluate(({ tag }) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const t = document.body.innerText;
    const controls = [...document.querySelectorAll('button,a,[role="button"]')].filter(vis)
      .map(b => (b.getAttribute('aria-label') || b.innerText || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    return {
      repliesHeader: (t.match(/Replies \(\d+\)/) || [null])[0],
      thirdPartyReplyOnScreen: t.includes(tag + ' third-party reply'),
      anySubscribeControl: controls.filter(c => /subscribe|follow|notify/i.test(c)),
      unreadMarkerWords: /new repl|unread/i.test(t),
    };
  }, { tag });

  out.asserted = {
    url: page.url(),
    replierB: { notificationsBefore: bBefore.total, notificationsAfter: bAfter.total,
                newest: bAfter.newest },
    parentAuthorA: { notificationsBefore: aBefore.total, notificationsAfter: aAfter.total,
                     newest: aAfter.newest },
    samplesOver30s: [...new Set(samples.map(s => s.total))],
    visibilityStates: [...new Set(samples.map(s => s.visibilityState))],
    threadPanel: panel,
  };
  if (bAfter.total !== bBefore.total || aAfter.total <= aBefore.total
      || !panel.thirdPartyReplyOnScreen) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected B\'s notification list '
                 + 'unchanged and A\'s to gain a "New thread reply". Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 3;
  out.leftToDo =
    'This window belongs to B, who replied in this thread. A third person has just replied to the same '
    + `thread — the reply is visible in the panel on the right. Open the bell (top right): there is `
    + `nothing about it, and the count has not moved (${bBefore.total} before, ${bAfter.total} after, `
    + 'sampled for 30 s). The thread panel offers no way to subscribe either — no control on it '
    + 'matches subscribe/follow/notify. Check the "N replies" marker on the parent message in the '
    + 'channel too: it carries no unread mark. '
    + `The author of the parent message did get one: their list went ${aBefore.total} → ${aAfter.total} `
    + 'with a "New thread reply" entry.';
  return out;
};
