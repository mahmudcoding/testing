import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const a = await page.evaluate('('+RTC_STATS+')()');
  await page.waitForTimeout(6000);
  const b = await page.evaluate('('+RTC_STATS+')()');
  const sum = s => s.stats.map(pc => ({
    conn: pc.conn,
    outA: pc.out.filter(o=>o.kind==='audio').reduce((x,o)=>x+(o.bytes||0),0),
    outV: pc.out.filter(o=>o.kind==='video').reduce((x,o)=>x+(o.bytes||0),0),
    inA: pc.in.filter(o=>o.kind==='audio').reduce((x,o)=>x+(o.bytes||0),0),
    inV: pc.in.filter(o=>o.kind==='video').reduce((x,o)=>x+(o.bytes||0),0),
    inAudioLevel: pc.in.filter(o=>o.kind==='audio').map(o=>o.audioLevel)
  }));
  const A = sum(a), B = sum(b);
  return {seconds: 6, pcs: A.map((x,i)=>({
    conn: x.conn,
    d_outAudio: B[i]?B[i].outA-x.outA:null, d_outVideo: B[i]?B[i].outV-x.outV:null,
    d_inAudio: B[i]?B[i].inA-x.inA:null, d_inVideo: B[i]?B[i].inV-x.inV:null,
    inAudioLevel: B[i]?B[i].inAudioLevel:null }))};
};
