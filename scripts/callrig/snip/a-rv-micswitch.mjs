import { DOM } from './lib.mjs';
const TRACK = `(async () => {
  const out = [];
  for (const pc of (window.__pcs||[])) {
    if (pc.connectionState === 'closed') continue;
    for (const s of pc.getSenders()) {
      if (s.track && s.track.kind === 'audio') {
        const st = s.track.getSettings();
        out.push({ label: s.track.label, deviceId: String(st.deviceId||'').slice(0,14), enabled: s.track.enabled, state: s.track.readyState });
      }
    }
  }
  return out;
})()`;
const readPanel = `(() => {
  const w = [...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=dialog],[role=menu]')].filter(window.__qa.boxVis).pop();
  if (!w) return null;
  const rows = [...w.querySelectorAll('button[data-selected]')].filter(window.__qa.boxVis)
    .map(n=>({ text:(n.innerText||'').replace(/\\s+/g,' ').trim().slice(0,44), sel:n.getAttribute('data-selected') }));
  return rows;
})()`;
export default async ({ page }) => {
  const out = { steps: [] };
  await page.evaluate(DOM);
  const openPanel = async () => {
    await page.evaluate(DOM);
    let open = await page.evaluate(readPanel);
    if (!open) {
      await page.locator('button[aria-label="Select microphone"]').first().click();
      await page.waitForTimeout(1800); await page.evaluate(DOM);
      open = await page.evaluate(readPanel);
    }
    return open;
  };
  const snapshot = async (tag) => {
    const rows = await openPanel();
    const tr = await page.evaluate(TRACK);
    const prefs = await page.evaluate(() => localStorage.getItem('aloqa-call-device-prefs'));
    out.steps.push({ tag, rows, track: tr, prefs });
  };
  await snapshot('initial');
  // click the named microphone row
  const want = process.env.QA_DEV || 'Fake Audio Input 1';
  await openPanel();
  const hit = await page.evaluate((w) => {
    const wr = [...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=dialog],[role=menu]')].filter(window.__qa.boxVis).pop();
    const b = [...wr.querySelectorAll('button[data-selected]')].find(n=>(n.innerText||'').includes(w));
    if (!b) return null; b.scrollIntoView({block:'center'});
    const r=b.getBoundingClientRect();
    return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), was:b.getAttribute('data-selected'), text:(b.innerText||'').replace(/\s+/g,' ').slice(0,44)};
  }, want);
  out.clickTarget = hit;
  if (hit) { await page.mouse.click(hit.x, hit.y); await page.waitForTimeout(3500); }
  await snapshot('after-click');
  await page.waitForTimeout(6000);
  await snapshot('after-6s');
  return out;
};
