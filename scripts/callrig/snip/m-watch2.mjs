import { DOM } from './lib.mjs';
// Cheap overlay-scoped watcher. QA_WATCH_MS, QA_WATCH_EVERY.
// Scopes innerText to the call overlay (the calls hub sits behind it and doubles the cost).
export default async ({page}) => {
  await page.evaluate(DOM);
  const ms = Number(process.env.QA_WATCH_MS || 40000);
  const every = Number(process.env.QA_WATCH_EVERY || 300);
  const t0 = Date.now();
  const seen = new Map(); let baseline = null; let n = 0; const slow = [];
  while (Date.now() - t0 < ms) {
    const a = Date.now();
    const s = await page.evaluate(() => {
      const VOL = /^(\d+:\d{2}(:\d{2})?|\d+ms|\d+%|running \d+ (min|sec|hour)s?|Excellent|Good|Poor|Excellent ·|Poor ·|Good ·)$/;
      const root = document.querySelector('[data-testid="call-overlay-expanded"]') || document.body;
      const lines = [...new Set((root.innerText||'').split('\n').map(x=>x.trim()).filter(Boolean))].filter(l=>!VOL.test(l));
      return {vis: document.visibilityState, lines, url: location.pathname};
    });
    const t = Date.now() - t0;
    const cost = Date.now() - a; if (cost > 1500) slow.push({t, cost});
    if (!baseline) baseline = new Set(s.lines);
    for (const l of s.lines) {
      if (!seen.has(l)) seen.set(l, {first:t, last:t, n:1, base: baseline.has(l)});
      else { const e = seen.get(l); e.last = t; e.n++; }
    }
    n++;
    await page.waitForTimeout(every);
  }
  const dur = Date.now()-t0;
  return {samples:n, durMs:dur, expectedSamples: Math.round(ms/every),
    healthy: n >= Math.round(ms/every)*0.6, slowSamples: slow.slice(0,6),
    appeared: [...seen.entries()].filter(([l,e])=>!e.base).map(([l,e])=>({line:l.slice(0,120), first:e.first, last:e.last, n:e.n})),
    vanished: [...seen.entries()].filter(([l,e])=>e.base && e.last < dur - every*3).map(([l,e])=>({line:l.slice(0,120), last:e.last}))};
};
