import { WS } from './a-nb-lib.mjs';
// Patch the PROTOTYPE, not the constructor: the SDK may cache RTCPeerConnection at module load,
// but every instance still resolves createDataChannel / addEventListener through the prototype.
export default async ({page, ctx}) => {
  const CALL = process.env.QA_CALL;
  await ctx.addInitScript(() => {
    if (window.__dc2) return;
    window.__dc2 = true;
    window.__dcLog = [];
    let pcSeq = 0;
    const tag = (pc) => { if (!pc.__qaId) pc.__qaId = ++pcSeq; return pc.__qaId; };
    const wrap = (ch, pc, origin) => {
      try {
        window.__dcLog.push({t: Date.now(), ev: 'open', pc: tag(pc), label: ch.label, origin});
        ch.addEventListener('message', (e) => {
          let len = null, text = null;
          try {
            if (e.data instanceof ArrayBuffer) { const u = new Uint8Array(e.data); len = u.length;
              text = Array.from(u.slice(0, 120)).map(b => (b >= 32 && b < 127) ? String.fromCharCode(b) : '.').join('');
            } else { const s2 = String(e.data); len = s2.length; text = s2.slice(0, 140); }
          } catch {}
          window.__dcLog.push({t: Date.now(), ev: 'msg', pc: tag(pc), label: ch.label, len, text});
          if (window.__dcLog.length > 4000) window.__dcLog.splice(0, 2000);
        });
      } catch {}
    };
    const P = window.RTCPeerConnection && window.RTCPeerConnection.prototype;
    if (P) {
      const origCreate = P.createDataChannel;
      P.createDataChannel = function (label, opts) {
        const ch = origCreate.call(this, label, opts);
        wrap(ch, this, 'local');
        return ch;
      };
      const origAdd = P.addEventListener;
      P.addEventListener = function (type, fn, ...rest) {
        if (type === 'datachannel') {
          const wrapped = (e) => { try { wrap(e.channel, this, 'remote'); } catch {} return fn && fn.call(this, e); };
          return origAdd.call(this, type, wrapped, ...rest);
        }
        return origAdd.call(this, type, fn, ...rest);
      };
      Object.defineProperty(P, 'ondatachannel', {
        configurable: true,
        set(fn) { this.__qaOnDC = fn; origAdd.call(this, 'datachannel', (e) => { try { wrap(e.channel, this, 'remote-on'); } catch {} return fn && fn.call(this, e); }); },
        get() { return this.__qaOnDC; }
      });
    }
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${CALL}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const j = page.locator('button', {hasText:/^Join$/}).first();
  if (await j.count()) { await j.click(); await page.waitForTimeout(8000); }
  return await page.evaluate(() => ({hooked: !!window.__dc2, entries: (window.__dcLog||[]).length,
    channels: [...new Set((window.__dcLog||[]).filter(x=>x.ev==='open').map(x=>x.pc+':'+x.label+':'+x.origin))]}));
}
