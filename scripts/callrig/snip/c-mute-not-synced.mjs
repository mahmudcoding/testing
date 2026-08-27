/* Repro — [BE][CHAT] Состояние приглушения не отдаётся сервером: на другом
 * устройстве канал показан обычным, хотя уведомления не приходят.
 *
 *   ./d c:alice snip/c-mute-not-synced.mjs
 *
 * Mutes the channel here, then signs the SECOND window (the one launched for
 * "dave") in as the same account — its own cookies and localStorage, i.e. the
 * finding's "another device" — and opens the same channel there.
 * Comparing the two headers is the human's step.
 *
 * That second window is left holding this account, not dave. Put it back with
 *   ./ensure.sh C dave     (after ./stop.sh C dave)
 */
import { rigPort } from '../rigmap.mjs';

export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCPRIVATE0001';
  const SEL = 'button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };

  const header = (p) => p.evaluate((s) => {
    const b = document.querySelector(s);
    return b ? { label: b.getAttribute('aria-label'), pressed: b.getAttribute('aria-pressed') } : null;
  }, SEL);

  // ── 1. GET THERE — device 1 mutes the channel ─────────────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  const email = await page.evaluate(async () =>
    (await (await fetch('/api/v1/auth/me', { credentials: 'include' })).json()).email);
  // start from a known-unmuted channel: the state the header reads is local
  await page.evaluate(async (ch) => {
    await fetch(`/api/v1/notifications/channels/${ch}/mute`, { method: 'DELETE', credentials: 'include' });
    localStorage.removeItem('aloqa.channel.mute');
  }, ch);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);

  await page.locator(SEL).first().click();
  await page.waitForTimeout(1300);
  const durations = await page.evaluate(() => {
    const w = document.querySelector('[data-radix-popper-content-wrapper]');
    return w ? (w.innerText || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 8) : [];
  });
  const picked = await page.evaluate(() => {
    const w = document.querySelector('[data-radix-popper-content-wrapper]');
    if (!w) return false;
    const b = [...w.querySelectorAll('button,[role="menuitem"],div')]
      .find(x => (x.innerText || '').trim() === 'For 1 hour');
    if (!b) return false;
    b.click(); return true;
  });
  await page.waitForTimeout(3000);
  const device1 = await header(page);
  if (!picked || !device1 || device1.label !== 'Unmute notifications') {
    out.asserted = { durations, picked, device1 };
    out.leftToDo = 'Setup did not reach the state this finding needs — the channel was not muted on '
                 + 'this device. Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(1);                                     // step 1: muted for 1 hour on device 1

  // ── 2. the same account in a second browser ───────────────────────────
  let device2 = null, secondWindow = null, serverFields = null;
  try {
    const { chromium } = await import('playwright');
    const b = await chromium.connectOverCDP(`http://127.0.0.1:${rigPort('C', 'dave')}`);
    const c2 = b.contexts()[0];
    const p2 = c2.pages().find(p => p.url().includes('airion-cargo.store')) || c2.pages()[0];
    await c2.clearCookies();
    await p2.goto('https://airion-cargo.store/login', { waitUntil: 'domcontentloaded' });
    await p2.waitForTimeout(1500);
    await p2.evaluate(() => localStorage.clear());
    await p2.reload({ waitUntil: 'domcontentloaded' });
    await p2.waitForTimeout(1500);
    await p2.fill('input[type=email]', email);
    await p2.fill('input[type=password]', 'QaPass123!');
    await p2.click('button[type=submit]');
    await p2.waitForTimeout(5000);
    const who = await p2.evaluate(async () => {
      const r = await fetch('/api/v1/auth/me', { credentials: 'include' });
      return r.ok ? (await r.json()).email : 'status ' + r.status;
    });
    await p2.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
    await p2.waitForTimeout(8000);
    device2 = await header(p2);
    serverFields = await p2.evaluate(async ({ ws, ch }) => {
      const j = await (await fetch(`/api/v1/workspaces/${ws}/channels`, { credentials: 'include' })).json();
      const list = j.channels || j.data || j || [];
      const c = (Array.isArray(list) ? list : []).find(x => x.id === ch) || {};
      return { keysOnChannel: Object.keys(c).filter(k => /mute/i.test(k)),
               localMuteStore: localStorage.getItem('aloqa.channel.mute') };
    }, { ws, ch });
    secondWindow = { signedInAs: who, muteStoreOnDevice2: serverFields.localMuteStore };
    await b.close();
  } catch (e) {
    out.asserted = { device1 };
    out.leftToDo = 'Setup did not reach the state this finding needs — could not prepare the second '
                 + 'device: ' + String(e).slice(0, 90) + '. Re-run, or follow the written steps by hand.';
    return out;
  }
  progress(2);                                     // step 2: same account opened in a second browser

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  const muteState = await page.evaluate(async (ch) => {
    const r = await fetch(`/api/v1/notifications/channels/${ch}/mute`, { method: 'POST',
      credentials: 'include', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ duration_seconds: 3600 }) });
    return { reMuteStatus: r.status, body: (await r.text()).slice(0, 60) };
  }, ch);

  out.asserted = {
    url: page.url(),
    account: email,
    durationsOffered: durations,
    device1Header: device1,
    device2: secondWindow,
    device2Header: device2,
    muteRelatedKeysOnTheChannelPayload: serverFields.keysOnChannel,
    serverStillAcceptsTheMute: muteState,
  };
  if (!device2 || device2.label !== 'Mute notifications'
      || secondWindow.signedInAs !== email || serverFields.keysOnChannel.length !== 0) {
    out.leftToDo = 'Setup did not reach the state this finding needs — expected the second window '
                 + 'signed in as the same account, showing the channel as unmuted, with no mute field '
                 + 'in the channel payload. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    'Two windows, one account. This one muted the channel and its header button reads "Unmute '
    + 'notifications". The second window — same account, its own cookies and localStorage — has the '
    + 'same channel open and its header button reads "Mute notifications", as if nothing were muted. '
    + 'Its local mute store is empty and the channel payload the server sends it carries no mute field '
    + 'at all. Step 3: post a message into this channel from another member and wait — no notification '
    + 'arrives on either window, so the mute is real on the server; only the second device cannot see '
    + 'it. That second window is left signed in as this account, not as its usual one.';
  return out;
};
