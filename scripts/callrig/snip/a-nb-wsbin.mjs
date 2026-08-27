import { WS } from './a-nb-lib.mjs';
// WebSocket recorder that renders BINARY frames as printable-ASCII previews.
export default async ({page, ctx}) => {
  const CALL = process.env.QA_CALL;
  await ctx.addInitScript(() => {
    if (window.__wsB) return;
    window.__wsB = true; window.__wsLog2 = [];
    const prev = (buf) => { const u = new Uint8Array(buf);
      return {len: u.length, ascii: Array.from(u.slice(0, 160)).map(b => (b>=32&&b<127)?String.fromCharCode(b):'.').join('')}; };
    const O = window.WebSocket;
    function P(...a) {
      const s = new O(...a);
      const url = String(a[0]); window.__wsSeq = (window.__wsSeq||0)+1; const sockId = window.__wsSeq;
      s.addEventListener('message', async (e) => {
        try {
          let rec = {t: Date.now(), sock: sockId, url, dir: 'in'};
          if (typeof e.data === 'string') { rec.text = e.data.slice(0, 200); rec.len = e.data.length; }
          else if (e.data instanceof ArrayBuffer) Object.assign(rec, prev(e.data));
          else if (e.data instanceof Blob) { const b = await e.data.arrayBuffer(); Object.assign(rec, prev(b)); }
          window.__wsLog2.push(rec);
          if (window.__wsLog2.length > 4000) window.__wsLog2.splice(0, 2000);
        } catch {}
      });
      const snd = s.send.bind(s);
      s.send = (x) => {
        try {
          let rec = {t: Date.now(), sock: sockId, url, dir: 'out'};
          if (typeof x === 'string') { rec.text = x.slice(0,200); rec.len = x.length; }
          else if (x instanceof ArrayBuffer) Object.assign(rec, prev(x));
          else if (ArrayBuffer.isView(x)) Object.assign(rec, prev(x.buffer));
          window.__wsLog2.push(rec);
        } catch {}
        return snd(x);
      };
      return s;
    }
    P.prototype = O.prototype; Object.assign(P, O); window.WebSocket = P;
  });
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${CALL}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const j = page.locator('button', {hasText:/^Join$/}).first();
  if (await j.count()) { await j.click(); await page.waitForTimeout(8000); }
  return await page.evaluate(() => ({hooked: !!window.__wsB, entries: (window.__wsLog2||[]).length,
    urls: [...new Set((window.__wsLog2||[]).map(x=>x.url))]}));
}
