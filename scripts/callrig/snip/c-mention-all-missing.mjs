/* Repro — [BE][CHAT] Про @all и @here приходит «You were mentioned»,
 * но на странице Mentions их нет.
 *
 *   ./d c:carol snip/c-mention-all-missing.mjs
 *
 * Drives the other account's window to post @all, @here and one ordinary
 * mention (the control), then parks the recipient in the channel with all three
 * notifications already delivered. Opening Mentions is the human's step.
 */
import { rigPort } from '../rigmap.mjs';

export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCGENERAL0001';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const tag = 'QA-MENTION-' + Math.random().toString(36).slice(2, 6);

  // ── 1. GET THERE — the other account posts the three messages ──────────
  let sent = null;
  try {
    const { chromium } = await import('playwright');
    const b = await chromium.connectOverCDP(`http://127.0.0.1:${rigPort('C', 'alice')}`);
    const ap = b.contexts()[0].pages().find(p => p.url().includes('airion-cargo.store'))
            || b.contexts()[0].pages()[0];
    await ap.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
    await ap.waitForTimeout(8000);
    const comp = ap.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
    const empty = async () => {
      for (let i = 0; i < 8; i++) {
        if ((await comp.evaluate(e => e.innerText.trim())) === '') return true;
        await comp.click(); await ap.keyboard.press('Meta+A'); await ap.keyboard.press('Delete');
        await ap.waitForTimeout(220);
      }
      return false;
    };
    const send = async (handle, tail) => {
      await empty(); await comp.click();
      await comp.type('@' + handle, { delay: 70 }); await ap.waitForTimeout(2200);
      const opt = ap.locator('[role="option"], [role="listbox"] li').first();
      const picked = await opt.count();
      if (picked) { await opt.click(); await ap.waitForTimeout(900); }     // choose the suggestion
      await comp.type(' ' + tail, { delay: 40 }); await ap.waitForTimeout(600);
      await ap.keyboard.press('Enter'); await ap.waitForTimeout(4500);
      return ap.evaluate(async (ch) => {
        const j = await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,
                                     { credentials: 'include' })).json();
        const m = j.messages[0];
        return { body: (m.body || '').slice(0, 44),
                 mention_ids: m.mention_ids === undefined ? '(absent)' : JSON.stringify(m.mention_ids) };
      }, ch);
    };
    const all  = await send('all',  tag + ' ALL');       progress(1);
    const here = await send('here', tag + ' HERE');      progress(2);
    const ctl  = await send('qa_c_carol', tag + ' DIRECT'); progress(3);
    await empty();
    await b.close();
    sent = { all, here, control: ctl };
  } catch (e) {
    out.leftToDo = 'Setup did not reach the state this finding needs — could not drive the sending '
                 + 'account\'s window: ' + String(e).slice(0, 90)
                 + '. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 2. PROVE IT — recipient's side ────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const notif = await page.evaluate(async (tag) => {
    const j = await (await fetch('/api/v1/notifications?limit=10', { credentials: 'include' })).json();
    return (j.notifications || j.data || j || [])
      .filter(n => (n.body || '').includes(tag))
      .map(n => ({ title: n.title, body: (n.body || '').slice(0, 46) }));
  }, tag);

  out.asserted = {
    url: page.url(),
    storedMessages: sent,
    notificationsForRecipient: notif,
    mentionedNotifications: notif.filter(n => /mentioned/i.test(n.title || '')).length,
  };
  const broadcastsUnmarked = sent.all.mention_ids === '(absent)' && sent.here.mention_ids === '(absent)';
  if (notif.length !== 3 || out.asserted.mentionedNotifications !== 3 || !broadcastsUnmarked) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected three "You were '
                 + 'mentioned" notifications for this run and no mention_ids on the two broadcast '
                 + 'messages. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 3. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 3;
  out.leftToDo =
    'Step 4 of the finding: on this recipient window, open the bell (top right) — three "You were '
    + `mentioned" entries are there, one each for @all, @here and the ordinary mention, all tagged `
    + `${tag}. Then click Mentions in the left sidebar, the page titled "Where you were mentioned". `
    + `Only the ordinary mention (${tag} DIRECT) is listed; the @all and @here messages are absent `
    + 'and the "All (N)" counter does not count them.';
  return out;
};
