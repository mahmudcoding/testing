import { DOM } from './lib.mjs';
const TRACK = `async () => {
  const out = [];
  for (const pc of (window.__pcs||[])) {
    if (pc.connectionState === 'closed') continue;
    for (const s of pc.getSenders()) {
      if (s.track && s.track.kind === 'audio') {
        const st = s.track.getSettings();
        out.push({ label: s.track.label, deviceId: (st.deviceId||'').slice(0,14), enabled: s.track.enabled, state: s.track.readyState });
      }
    }
  }
  return out;
}`;
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  out.trackBefore = await page.evaluate(TRACK);
  const b = page.locator('button[aria-label="Select microphone"]').first();
  out.btn = await b.count();
  if (!out.btn) return out;
  await b.click(); await page.waitForTimeout(2000);
  await page.evaluate(DOM);
  out.panel = await page.evaluate(() => {
    const w = [...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=dialog],[role=menu]')].filter(window.__qa.boxVis).pop();
    if (!w) return null;
    const rows = [...w.querySelectorAll('[data-selected],[role=menuitemradio],[role=option],button,li')]
      .filter(window.__qa.boxVis)
      .map(n=>({ tag:n.tagName, text:(n.innerText||n.textContent||'').replace(/\s+/g,' ').trim().slice(0,42),
                 sel:n.getAttribute('data-selected'), checked:n.getAttribute('aria-checked'), state:n.getAttribute('data-state'),
                 tid:n.getAttribute('data-testid') }))
      .filter(r=>r.text);
    return { text: w.innerText.replace(/\s+/g,' ').slice(0,400), rows };
  });
  return out;
};
