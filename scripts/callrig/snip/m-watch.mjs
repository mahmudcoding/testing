import { DOM } from './lib.mjs';
// Generic cross-window observer. Poll from BEFORE the trigger.
//   QA_WATCH_MS=45000 QA_WATCH_EVERY=300 ./d c:alice snip/m-watch.mjs
// Records, per sample: visibilityState, mic/cam control state, and the set of
// body.innerText lines. Reports lines that APPEARED or VANISHED with their first/last t,
// plus max opacity seen for each appeared line's owning element.
export default async ({page}) => {
  await page.evaluate(DOM);
  const ms = Number(process.env.QA_WATCH_MS || 40000);
  const every = Number(process.env.QA_WATCH_EVERY || 300);
  const t0 = Date.now();
  const seen = new Map();   // line -> {first, last, n, maxOp}
  const ctrl = [];
  let baseline = null;
  while (Date.now() - t0 < ms) {
    const s = await page.evaluate(() => {
      const q = window.__qa;
      const T = (e) => (e.innerText || '');
      const VOL = /^(\d+:\d{2}(:\d{2})?|\d+ms|running \d+ (min|sec|hour)s?|\d+ (min|sec)s?|Excellent|Good|Poor)$/;
      const lines = [...new Set(T(document.body).split('\n').map(x=>x.trim()).filter(Boolean))].filter(l => !VOL.test(l));
      const opOf = (line) => {
        let best = 0;
        for (const el of document.querySelectorAll('*')) {
          if (el.children.length) continue;
          if ((el.textContent||'').trim() !== line) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) continue;
          const o = q.opacity ? q.opacity(el) : 1;
          if (o > best) best = o;
        }
        return best;
      };
      const btn = (re) => {
        const b = [...document.querySelectorAll('button')].filter(x=>x.getClientRects().length)
          .find(x => re.test(x.getAttribute('aria-label')||x.textContent||''));
        return b ? {l: b.getAttribute('aria-label')||b.textContent, p: b.getAttribute('aria-pressed'), d: b.disabled} : null;
      };
      return { vis: document.visibilityState, lines, mic: btn(/^(Mute|Unmute)$/), cam: btn(/^Turn camera (on|off)$/),
               hand: btn(/hand/i), url: location.pathname,
               _opOf: null };
    });
    const t = Date.now() - t0;
    if (!baseline) baseline = new Set(s.lines);
    for (const l of s.lines) {
      if (!seen.has(l)) seen.set(l, {first: t, last: t, n: 1, base: baseline.has(l)});
      else { const e = seen.get(l); e.last = t; e.n++; }
    }
    ctrl.push({t, vis: s.vis, mic: s.mic && s.mic.l, micP: s.mic && s.mic.p, cam: s.cam && s.cam.l, url: s.url});
    await page.waitForTimeout(every);
  }
  const appeared = [...seen.entries()].filter(([l,e]) => !e.base).map(([l,e]) => ({line: l.slice(0,120), first: e.first, last: e.last, n: e.n}));
  const vanished = [...seen.entries()].filter(([l,e]) => e.base && e.last < ms - every*3).map(([l,e]) => ({line: l.slice(0,120), last: e.last}));
  // collapse the control trace to transitions only
  const trans = []; let prev = null;
  for (const c of ctrl) { const k = JSON.stringify([c.vis,c.mic,c.micP,c.cam,c.url]); if (k !== prev) { trans.push(c); prev = k; } }
  const dur = Date.now()-t0;
  return { samples: ctrl.length, durMs: dur, expectedSamples: Math.round(ms/every),
           healthy: ctrl.length >= Math.round(ms/every)*0.6,
           appeared, vanished, ctrlTransitions: trans };
};
