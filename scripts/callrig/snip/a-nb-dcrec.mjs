import { WS } from './a-nb-lib.mjs';
// Install an RTCDataChannel recorder, then navigate+join in the same drive.
export default async ({page, ctx}) => {
  const CALL = process.env.QA_CALL;
  await ctx.addInitScript(() => {
    if (window.__dcHooked) return;
    window.__dcHooked = true;
    window.__dcLog = [];
    const pcIndex = new WeakMap();
    let n = 0;
    const OP = window.RTCPeerConnection;
    const wrapChannel = (ch, pcId, origin) => {
      try {
        window.__dcLog.push({t: Date.now(), ev: 'open', pc: pcId, label: ch.label, origin});
        ch.addEventListener('message', (e) => {
          let kind = typeof e.data, len = null, text = null;
          try {
            if (e.data instanceof ArrayBuffer) { len = e.data.byteLength;
              const u = new Uint8Array(e.data);
              text = Array.from(u.slice(0, 90)).map(b => (b >= 32 && b < 127) ? String.fromCharCode(b) : '.').join('');
            } else { len = String(e.data).length; text = String(e.data).slice(0, 120); }
          } catch {}
          window.__dcLog.push({t: Date.now(), ev: 'msg', pc: pcId, label: ch.label, kind, len, text});
          if (window.__dcLog.length > 3000) window.__dcLog.splice(0, 1500);
        });
      } catch {}
    };
    function Patched(...a) {
      const pc = new OP(...a);
      const id = ++n; pcIndex.set(pc, id);
      const orig = pc.createDataChannel.bind(pc);
      pc.createDataChannel = (label, opts) => { const ch = orig(label, opts); wrapChannel(ch, id, 'local'); return ch; };
      pc.addEventListener('datachannel', (e) => wrapChannel(e.channel, id, 'remote'));
      return pc;
    }
    Patched.prototype = OP.prototype; Object.assign(Patched, OP);
    window.RTCPeerConnection = Patched;
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${CALL}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const j = page.locator('button', {hasText:/^Join$/}).first();
  if (await j.count()) { await j.click(); await page.waitForTimeout(8000); }
  return await page.evaluate(() => ({hooked: !!window.__dcHooked, entries: (window.__dcLog||[]).length,
    channels: [...new Set((window.__dcLog||[]).filter(x=>x.ev==='open').map(x=>x.pc+':'+x.label+':'+x.origin))],
    path: location.pathname}));
}
