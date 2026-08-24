import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const a = await page.evaluate('('+RTC_STATS+')()');
  await page.waitForTimeout(8000);
  const b = await page.evaluate('('+RTC_STATS+')()');
  const inV = s => s.stats.flatMap(pc=>pc.in.filter(o=>o.kind==='video')).map(o=>({wh:`${o.w}x${o.h}`, bytes:o.bytes, dec:o.framesDec}));
  const A=inV(a), B=inV(b);
  const tiles = await page.evaluate(() => {
    const s=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return [...s.querySelectorAll('video')].map(v=>{
      const holder=v.closest('[aria-label]');
      return {lbl: holder? holder.getAttribute('aria-label').slice(0,40):null, w:v.videoWidth, h:v.videoHeight, paused:v.paused, muted:v.muted, ct: Math.round(v.currentTime*10)/10};
    });
  });
  await page.waitForTimeout(4000);
  const tiles2 = await page.evaluate(() => [...(document.querySelector('[data-testid="call-overlay-expanded"]')||document.body).querySelectorAll('video')].map(v=>({lbl:(v.closest('[aria-label]')||{}).getAttribute?.('aria-label')||'', ct:Math.round(v.currentTime*10)/10})));
  return {inboundBefore:A, inboundAfter:B, deltas: B.map((x,i)=>({wh:x.wh, dBytes:x.bytes-(A[i]?A[i].bytes:0), dFrames:x.dec-(A[i]?A[i].dec:0)})), tiles, tiles2};
};
