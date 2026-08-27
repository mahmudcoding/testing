// Install a WebSocket recorder as an init script, reload, and rejoin the call.
// Frames land in window.__wsLog. Use a-nb-wsdump.mjs to read them.
export default async ({page, ctx}) => {
  await ctx.addInitScript(() => {
    if (window.__wsHooked) return;
    window.__wsHooked = true;
    window.__wsLog = [];
    const O = window.WebSocket;
    function Patched(...args) {
      const s = new O(...args);
      try { window.__wsLog.push({t: Date.now(), dir: 'open', url: String(args[0]).slice(0, 120)}); } catch {}
      s.addEventListener('message', (e) => {
        try {
          const d = typeof e.data === 'string' ? e.data : '<binary>';
          window.__wsLog.push({t: Date.now(), dir: 'in', d: d.slice(0, 700)});
          if (window.__wsLog.length > 4000) window.__wsLog.splice(0, 2000);
        } catch {}
      });
      const send = s.send.bind(s);
      s.send = (x) => { try { window.__wsLog.push({t: Date.now(), dir: 'out', d: String(x).slice(0, 300)}); } catch {} return send(x); };
      return s;
    }
    Patched.prototype = O.prototype;
    Object.assign(Patched, O);
    window.WebSocket = Patched;
  });
  await page.reload({waitUntil: 'domcontentloaded'});
  await page.waitForTimeout(9000);
  const j = page.locator('button', {hasText:/^Join$/}).first();
  if (await j.count()) { await j.click(); await page.waitForTimeout(8000); }
  return await page.evaluate(() => ({
    hooked: !!window.__wsHooked, frames: (window.__wsLog||[]).length,
    path: location.pathname
  }));
}
