import { RTC_STATS } from './lib.mjs';
export default async ({page, ctx}) => {
  const sum = s => s.stats.reduce((a,pc)=>({
    inA: a.inA + pc.in.filter(o=>o.kind==='audio').reduce((x,o)=>x+(o.bytes||0),0),
    inV: a.inV + pc.in.filter(o=>o.kind==='video').reduce((x,o)=>x+(o.bytes||0),0),
    frames: a.frames + pc.in.filter(o=>o.kind==='video').reduce((x,o)=>x+(o.framesDec||0),0),
    outA: a.outA + pc.out.filter(o=>o.kind==='audio').reduce((x,o)=>x+(o.bytes||0),0)
  }), {inA:0,inV:0,frames:0,outA:0});
  const g = async () => sum(await page.evaluate('('+RTC_STATS+')()'));
  const a = await g();
  await ctx.setOffline(true);
  await page.waitForTimeout(12000);
  const b = await g();
  const banner = await page.evaluate(()=>[...document.querySelectorAll('[role="alert"],[role="status"]')].map(e=>e.innerText.replace(/\n+/g,' ').slice(0,80)).filter(Boolean));
  const netTxt = await page.evaluate(()=>{const n=document.querySelector('[data-testid="call-network-indicator"]');return n?n.innerText.replace(/\n+/g,'/'):null;});
  await ctx.setOffline(false);
  await page.waitForTimeout(8000);
  const c = await g();
  return {
    duringOffline12s: {d_inVideo: b.inV-a.inV, d_framesDecoded: b.frames-a.frames, d_inAudio: b.inA-a.inA, d_outAudio: b.outA-a.outA},
    afterOnline8s:    {d_inVideo: c.inV-b.inV, d_framesDecoded: c.frames-b.frames, d_inAudio: c.inA-b.inA, d_outAudio: c.outA-b.outA},
    bannersWhileOffline: banner, networkIndicatorWhileOffline: netTxt
  };
};
