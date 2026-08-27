import { RTC_STATS } from './lib.mjs';
export default async ({ page }) => {
  const has = await page.evaluate(()=>({ pcs:(window.__pcs||[]).length, hooked: !!window.__pcs }));
  const s1 = await page.evaluate(`(${RTC_STATS})()`);
  await page.waitForTimeout(5000);
  const s2 = await page.evaluate(`(${RTC_STATS})()`);
  const sum = (s)=> (s.stats||[]).map(x=>({conn:x.conn, out:x.out.map(o=>`${o.kind}:${o.bytes}b/${o.framesEnc??'-'}f`), in:x.in.map(i=>`${i.kind}:${i.bytes}b/${i.framesDec??'-'}f/E${(i.totalAudioEnergy??0).toFixed?.(4)??'-'}`)}));
  return { hook:has, pcs:s2.pcs, gum:s2.gum, t0:sum(s1), t5:sum(s2) };
};
