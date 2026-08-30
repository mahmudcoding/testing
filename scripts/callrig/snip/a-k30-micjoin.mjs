/* Join from the lobby, then read which audio device the call actually publishes:
   the sender's track label (decisive) plus every getUserMedia constraint seen. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  out.pre = await page.evaluate(() => ({
    screen: document.querySelector('[data-testid="lobby-page"]') ? 'lobby' : 'other',
    combo: [...document.querySelectorAll('[role=combobox]')]
      .find(e => /Select microphone/i.test(e.getAttribute('aria-label')||''))?.innerText.trim() ?? null,
  }));
  await page.locator('[data-testid="lobby-join"]').click();
  await page.waitForTimeout(12000);
  out.post = await page.evaluate(() => ({
    url: location.pathname,
    screen: document.querySelector('[data-testid="call-overlay-expanded"]') ? 'in-call' : 'other',
  }));
  out.published = await page.evaluate(() => {
    const pcs = window.__pcs || [];
    const rows = [];
    for (const pc of pcs) {
      try {
        for (const s of pc.getSenders()) {
          if (s.track) rows.push({ kind: s.track.kind, label: s.track.label, enabled: s.track.enabled,
                                   muted: s.track.muted, state: s.track.readyState });
        }
      } catch (e) { rows.push({ err: String(e) }); }
    }
    return { pcCount: pcs.length, senders: rows };
  });
  out.gumAll = await page.evaluate(() => (window.__gumCalls||[]).map(c => JSON.stringify(c).slice(0,220)));
  // what the IN-CALL device menu says is selected
  out.inCallMenu = await page.evaluate(async () => {
    const q = window.__qa;
    const b = [...document.querySelectorAll('button')].filter(e=>q.vis(e))
      .find(e => /^Select microphone$/i.test((e.getAttribute('aria-label')||'').trim()));
    if (!b) return { ok:false };
    b.click();
    await new Promise(r => setTimeout(r, 1500));
    const items = [...document.querySelectorAll('[role=menuitemradio],[role=option],[role=menuitem]')].filter(e=>q.vis(e))
      .map(e => ({ t: e.textContent.trim().slice(0,45), checked: e.getAttribute('aria-checked'),
                   sel: e.getAttribute('aria-selected'), dstate: e.getAttribute('data-state') }));
    return { ok:true, items };
  });
  return out;
};
