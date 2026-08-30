import { DOM } from './lib.mjs';
// QA_RE='share' QA_MS=45000 — poll every 300ms, report label/disabled transitions with timestamps.
export default async ({page}) => {
  await page.evaluate(DOM);
  const re = process.env.QA_RE || 'share';
  const ms = Number(process.env.QA_MS || 45000);
  const t0 = Date.now(); const trans = []; let prev = null; let n = 0;
  while (Date.now() - t0 < ms) {
    const s = await page.evaluate((re) => {
      const R = new RegExp(re, 'i');
      const b = [...document.querySelectorAll('button')].filter(x=>x.getClientRects().length)
        .filter(x => R.test((x.getAttribute('aria-label')||x.textContent||'')));
      return {vis: document.visibilityState, hits: b.map(x=>({l:(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,40),
        d:x.disabled||x.getAttribute('aria-disabled')==='true', t:x.getAttribute('title')}))};
    }, re);
    n++;
    const k = JSON.stringify(s);
    if (k !== prev) { trans.push({t: Date.now()-t0, epoch: Date.now(), ...s}); prev = k; }
    await page.waitForTimeout(Number(process.env.QA_EVERY||300));
  }
  return {samples: n, t0epoch: t0, durMs: Date.now()-t0, transitions: trans};
};
