import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const r = await page.evaluate('('+RTC_STATS+')()');
  const sum = (arr,k) => arr.reduce((a,x)=>a+(x[k]||0),0);
  return {pcs:r.pcs, s:(r.stats||[]).map(x=>({conn:x.conn, ice:x.ice,
    outBytes:sum(x.out,'bytes'), outFramesEnc:sum(x.out,'framesEnc'),
    inBytes:sum(x.in,'bytes'), inFramesDec:sum(x.in,'framesDec'),
    inAudioEnergy:+(sum(x.in,'totalAudioEnergy')).toFixed(4)}))};
};
