/* Repro — [FE-WEB][CHAT][A11Y] Озвучка нового сообщения читает служебное
 * экранирование markdown.
 *
 *   ./d c:alice snip/c-a11y-escape.mjs
 *
 * Keeps this window on the channel, has another account type a message with
 * hyphens and ** into it, and captures what the screen-reader live region says
 * about it. Comparing that with the line on screen is the human's step.
 */
import { rigPort } from '../rigmap.mjs';

export default async ({ page, progress }) => {
  const ws = 'W4QCF1XTURESO01', ch = 'C4QCGENERAL0001';
  const out = { ready: false, asserted: {}, stepsDone: 0, leftToDo: '' };
  const tag = 'QAA11Y' + Math.random().toString(36).slice(2, 5);
  const TEXT = tag + ' dash-dash **bold** _it_';

  // ── 1. GET THERE — the recipient sits in the channel ──────────────────
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  // record everything the polite live regions say from before the message arrives
  await page.evaluate(() => {
    window.__a11y = [];
    const pick = () => [...document.querySelectorAll('[aria-live],[role="status"],[role="log"]')];
    const seen = new Set();
    window.__a11yTimer = setInterval(() => {
      for (const n of pick()) {
        const t = (n.textContent || '').trim();
        if (t && !seen.has(t)) {
          seen.add(t);
          const r = n.getBoundingClientRect();
          window.__a11y.push({ text: t.slice(0, 140), live: n.getAttribute('aria-live'),
                               role: n.getAttribute('role'),
                               size: Math.round(r.width) + '×' + Math.round(r.height) });
        }
      }
    }, 250);
  });
  progress(1);                                     // step 1: the channel is open and stays open

  // ── 2. another account types such a message into it ───────────────────
  let sent = null;
  try {
    const { chromium } = await import('playwright');
    const b = await chromium.connectOverCDP(`http://127.0.0.1:${rigPort('C', 'bob')}`);
    const bp = b.contexts()[0].pages().find(p => p.url().includes('airion-cargo.store'))
            || b.contexts()[0].pages()[0];
    await bp.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, { waitUntil: 'domcontentloaded' });
    await bp.waitForTimeout(8000);
    const comp = bp.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
    for (let i = 0; i < 8; i++) {
      if ((await comp.evaluate(e => e.innerText.trim())) === '') break;
      await comp.click(); await bp.keyboard.press('Meta+A'); await bp.keyboard.press('Delete');
      await bp.waitForTimeout(220);
    }
    await comp.click();
    await comp.type(TEXT, { delay: 25 });
    await bp.waitForTimeout(500);
    await bp.keyboard.press('Enter');
    await bp.waitForTimeout(5000);
    sent = await bp.evaluate(async ({ ch, tag }) => {
      const j = await (await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,
                                   { credentials: 'include' })).json();
      const m = (j.messages || []).find(x => (x.body || '').replace(/\\/g, '').includes(tag));
      return m ? { id: m.id, storedBody: m.body } : null;
    }, { ch, tag });
    await b.close();
  } catch (e) {
    out.leftToDo = 'Setup did not reach the state this finding needs — could not drive the sender\'s '
                 + 'window: ' + String(e).slice(0, 80) + '. Re-run, or follow the written steps by hand.';
    return out;
  }
  await page.waitForTimeout(8000);
  progress(2);                                     // step 2: the message was sent from another account

  // ── 3. PROVE IT ────────────────────────────────────────────────────────
  const seen = await page.evaluate(({ tag, id }) => {
    clearInterval(window.__a11yTimer);
    const e = id ? document.querySelector(`main [data-message-id="${id}"]`) : null;
    if (e) e.scrollIntoView({ block: 'center' });
    return {
      announcements: (window.__a11y || []).filter(a => a.text.includes(tag)),
      allAnnouncementsCaptured: (window.__a11y || []).length,
      onScreen: e ? (e.innerText || '').replace(/\s+/g, ' ').slice(0, 80) : null,
    };
  }, { tag, id: sent?.id });

  out.asserted = { url: page.url(), typedBySender: TEXT, storedBody: sent?.storedBody, ...seen };
  if (!sent || !seen.announcements.length || !/\\/.test(seen.announcements[0].text)) {
    out.leftToDo = 'Setup did not reach the state this finding needs — no live-region announcement '
                 + 'carrying this message was captured. Re-run, or follow the written steps by hand.';
    return out;
  }

  // ── 4. HAND OVER ───────────────────────────────────────────────────────
  const a = seen.announcements[0];
  out.ready = true;
  out.stepsDone = 2;
  out.leftToDo =
    'The message has arrived and is centred in the channel. Compare the two: on screen it reads '
    + `"${seen.onScreen}", while the hidden live region that announces it to a screen reader (`
    + `aria-live="${a.live}", ${a.size} px) says "${a.text}". Every hyphen and asterisk is read out `
    + 'with its backslash. Turn VoiceOver on (Cmd+F5) and have the message sent again to hear it, or '
    + 'inspect the live region node in DevTools.';
  return out;
};
