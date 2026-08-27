import { WS } from './a-nb-lib.mjs';
// Install the WS recorder on the context, then load the calls hub fresh.
export default async ({page, ctx}) => {
  await ctx.addInitScript(() => {
    if (window.__wsHooked) return;
    window.__wsHooked = true; window.__wsLog = [];
    const O = window.WebSocket;
    function Patched(...args) {
      const s = new O(...args);
      s.addEventListener('message', (e) => {
        try { const d = typeof e.data === 'string' ? e.data : '<binary>';
          window.__wsLog.push({t: Date.now(), dir: 'in', d: d.slice(0, 700)});
          if (window.__wsLog.length > 6000) window.__wsLog.splice(0, 3000); } catch {}
      });
      const send = s.send.bind(s);
      s.send = (x) => { try { window.__wsLog.push({t: Date.now(), dir:'out', d: (typeof x === 'string' ? x : '<binary>').slice(0,300)}); } catch {} return send(x); };
      return s;
    }
    Patched.prototype = O.prototype; Object.assign(Patched, O);
    window.WebSocket = Patched;
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>({hooked:!!window.__wsHooked, frames:(window.__wsLog||[]).length, path:location.pathname}));
};
