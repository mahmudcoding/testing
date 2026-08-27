import { HOOK } from './lib.mjs';
export default async ({ page }) => {
  await page.addInitScript(HOOK).catch(()=>{});
  const grab = () => page.evaluate(async () => {
    const pcs = window.__pcs || [];
    const out = [];
    for (const pc of pcs) {
      let s; try { s = await pc.getStats(); } catch { continue; }
      s.forEach(r => {
        if (r.type === 'inbound-rtp')
          out.push({ dir:'in', kind:r.kind, bytes:r.bytesReceived||0,
                     frames:r.framesDecoded||0, energy:+(r.totalAudioEnergy||0).toFixed(3) });
        if (r.type === 'outbound-rtp')
          out.push({ dir:'out', kind:r.kind, bytes:r.bytesSent||0, frames:r.framesEncoded||0 });
      });
    }
    return out;
  });
  const a = await grab();
  await page.waitForTimeout(5000);
  const b = await grab();
  const sum = arr => arr.reduce((o,r)=>{
    const k = r.dir+'-'+r.kind;
    o[k] = o[k] || {bytes:0, frames:0, energy:0};
    o[k].bytes += r.bytes; o[k].frames += r.frames; o[k].energy += r.energy||0;
    return o; }, {});
  const A = sum(a), B = sum(b), delta = {};
  for (const k of new Set([...Object.keys(A), ...Object.keys(B)]))
    delta[k] = { bytes: (B[k]?.bytes||0)-(A[k]?.bytes||0),
                 frames: (B[k]?.frames||0)-(A[k]?.frames||0),
                 energy: +(((B[k]?.energy||0)-(A[k]?.energy||0))).toFixed(4) };
  return { pcs: (await page.evaluate(()=> (window.__pcs||[]).length)), over5s: delta };
};
