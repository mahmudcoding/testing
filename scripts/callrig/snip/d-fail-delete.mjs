/* Repro — [FE-WEB][CHAT] Неудавшееся удаление показано как выполненное,
 * а сообщение остаётся у всех остальных.
 *
 *   ./d c:alice snip/c-fail-delete.mjs        (bob's window is positioned too)
 *
 * The failing DELETE is armed with page.route, and Playwright interception dies
 * with the CDP connection — so the script performs the delete itself and hands
 * the human the finished contradiction instead of stopping in front of it.
 */
import { rigPort } from '../rigmap.mjs';

export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';   // alice's own channel
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  // ── 1. GET THERE ──────────────────────────────────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const marker = 'QA-FAILDEL-' + Math.random().toString(36).slice(2, 7);
  const id = await page.evaluate(async ({ ch, marker }) => {
    const r = await fetch('/api/v1/messaging/messages', {
      method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ channel_id: ch, body: marker + ' delete-me',
                             idempotency_key: 'qa-' + Math.random().toString(36).slice(2) }) });
    return (await r.json()).id;
  }, { ch, marker });
  await page.waitForTimeout(3000);
  const rendered = await page.locator(`[data-message-id="${id}"]`).count();
  if (!rendered) {
    out.leftToDo = 'Setup did not reach the state this finding needs — the message never rendered. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(1);                                   // step 1: message sent in own channel

  // park a second member on the same channel so the contradiction is on screen twice
  let bob = 'not positioned — open the same channel as another member by hand';
  try {
    const { chromium } = await import('playwright');
    const b = await chromium.connectOverCDP(`http://127.0.0.1:${rigPort('C', 'bob')}`);
    const bp = b.contexts()[0].pages().find(p => p.url().includes('airion-cargo.store'))
            || b.contexts()[0].pages()[0];
    await bp.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
    await bp.waitForTimeout(6000);
    bob = (await bp.locator(`[data-message-id="${id}"]`).count())
        ? 'positioned on the same channel, message visible'
        : 'positioned on the same channel, message not rendered yet';
    await b.close();
  } catch (e) { bob = 'could not position second window: ' + String(e).slice(0, 60); }

  // ── 2. the request fails while the browser still believes it is online ──
  let aborted = 0;
  await page.route('**/messaging/channels/**', r => {
    if (r.request().method() === 'DELETE') { aborted++; return r.abort('failed'); }
    return r.continue();
  });
  progress(2);                                   // step 2: DELETE made to fail

  // ── 3. delete it through the UI ────────────────────────────────────────
  const el = page.locator(`[data-message-id="${id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(600);
  await el.locator('button[aria-label="More actions"]').first().click({ force: true });
  await page.waitForTimeout(900);
  await page.locator('[role="menu"]').getByText('Delete', { exact: true }).first().click();
  await page.waitForTimeout(1300);
  await page.locator('[role="dialog"] button, [role="alertdialog"] button')
            .filter({ hasText: /^Delete$/ }).first().click();
  await page.waitForTimeout(5000);
  progress(3);                                   // step 3: More actions -> Delete -> confirm

  // ── 4. PROVE IT ────────────────────────────────────────────────────────
  const seen = await page.evaluate((id) => {
    const e = document.querySelector(`[data-message-id="${id}"]`);
    const vis = x => { const r = x.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    return {
      text: e ? (e.innerText || '').replace(/\s+/g, ' ').slice(0, 120) : null,
      notices: [...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast]')]
                 .filter(vis).map(x => x.textContent.trim().slice(0, 60)),
    };
  }, id);
  await page.unroute('**/messaging/channels/**');
  const server = await page.evaluate(async ({ ch, id }) => {
    const j = await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=10`,
                                 { credentials: 'include' })).json();
    const m = (j.messages || j.data || j || []).find(x => x.id === id);
    return m ? { found: true, body: (m.body || '').slice(0, 60) } : { found: false };
  }, { ch, id });

  out.asserted = {
    url: page.url(),
    channel: 'own private channel',
    deleteRequestsAborted: aborted,
    messageOnAuthorScreen: seen.text,
    visibleNotices: seen.notices,
    stillOnServer: server,
    secondMember: bob,
  };
  if (aborted !== 1 || !/deleted/i.test(seen.text || '') || !server.found) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected exactly one aborted '
                 + 'DELETE, "This message was deleted" on screen and the body still on the server. '
                 + 'Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 5. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 3;
  out.leftToDo =
    'Step 4 of the finding: look at the author\'s window — the message now reads "This message was '
    + 'deleted" and no error was shown. Now look at the second member\'s window, already open on the '
    + 'same channel: the message is there and readable in full. '
    + 'Do NOT reload the author\'s page first — a reload re-sends the delete for real and the '
    + 'evidence goes away.';
  return out;
};
